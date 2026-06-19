from flask import Flask, request, jsonify, render_template
from ultralytics import YOLO
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ✅ Load your trained model
model = YOLO("runs/detect/train/weights/best.pt")  # or last.pt


# -----------------------------
# Home Page
# -----------------------------
@app.route("/")
def home():
    return render_template("index.html")


# -----------------------------
# Detect Page
# -----------------------------
@app.route("/detect")
def detect():
    return render_template("detect.html")


# -----------------------------
# Detection API
# -----------------------------
@app.route("/api/detect", methods=["POST"])
def detect_api():

    if "images" not in request.files:
        return jsonify({"error": "No images uploaded"}), 400

    files = request.files.getlist("images")

    particle_count = 0
    type_counts = {}

    try:

        for file in files:

            # save temp file
            filepath = os.path.join("temp.jpg")
            file.save(filepath)

            # run YOLO prediction
            results = model(filepath)

            for r in results:
                boxes = r.boxes

                particle_count += len(boxes)

                for box in boxes:
                    cls_id = int(box.cls[0])
                    cls_name = model.names[cls_id]

                    if cls_name not in type_counts:
                        type_counts[cls_name] = 0

                    type_counts[cls_name] += 1

        # format types
        types = []
        for name, count in type_counts.items():

            percentage = round((count / particle_count) * 100, 2) if particle_count > 0 else 0

            types.append({
                "name": name,
                "count": count,
                "percentage": percentage
            })

        # concentration logic
        if particle_count < 5:
            concentration = "Low"
            risk = "low"
            risk_percent = 20

        elif particle_count < 15:
            concentration = "Medium"
            risk = "moderate"
            risk_percent = 60

        else:
            concentration = "High"
            risk = "high"
            risk_percent = 90

        return jsonify({
            "particleCount": particle_count,
            "types": types,
            "concentration": concentration,
            "riskLevel": risk,
            "riskPercentage": risk_percent
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------------
# Run Server
# -----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)