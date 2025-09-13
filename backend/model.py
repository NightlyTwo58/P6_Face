import tensorflow as tf
from tensorflow.keras.preprocessing import image_dataset_from_directory
import json

train_ds = image_dataset_from_directory("backend/data/train", image_size=(128,128), batch_size=32)
val_ds = image_dataset_from_directory("backend/data/val", image_size=(128,128), batch_size=32)


base_model = tf.keras.applications.MobileNetV2(input_shape=(128,128,3),
                                               include_top=False,
                                               weights="imagenet")
base_model.trainable = False

model = tf.keras.Sequential([
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(len(train_ds.class_names), activation="softmax")
])

model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])

model.fit(train_ds, validation_data=val_ds, epochs=5)
model.save("backend/face_model.h5")
with open("backend/class_names.json", "w") as f:
    json.dump(train_ds.class_names, f)

# img = image.load_img("test.jpg", target_size=(128,128))
# x = image.img_to_array(img)
# x = np.expand_dims(x, axis=0)

# pred = model.predict(x)
# class_idx = np.argmax(pred[0])
# print("Perdict Class:", train_ds.class_names[class_idx])
