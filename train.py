from ultralytics import YOLO

# load model
model = YOLO("yolov8n.pt")

# train
model.train(resume=True)