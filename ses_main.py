import keras
from ses_funcs import *
from keras.models import Sequential
from keras.layers import Dense, Dropout, Flatten, Conv2D, MaxPool2D
import tensorflowjs as tfjs


feature_dim_1 = 13  # in order to match Meyda
feature_dim_2 = 60

channel = 1
epochs = 150
num_classes = 5     # asagi, sag, sol, tikla, yukari
batch_size = 20

x_train, x_test, y_train, y_test = get_train_test(feature_dim_1, feature_dim_2)

x_train = x_train.reshape(x_train.shape[0], feature_dim_1, feature_dim_2, channel)
x_test = x_test.reshape(x_test.shape[0], feature_dim_1, feature_dim_2, channel)

print("Data Shapes : ")
print("x_train, y_train : ", x_train.shape, y_train.shape)
print("x_test, y_test : ", x_test.shape, y_test.shape)


def get_model():

    MyModel = Sequential()
    MyModel.add(Conv2D(32, kernel_size=(2, 2), activation='relu', input_shape=(feature_dim_1, feature_dim_2, channel)))
    MyModel.add(Conv2D(48, kernel_size=(2, 2), activation='relu'))
    MyModel.add(Conv2D(120, kernel_size=(2, 2), activation='relu'))
    MyModel.add(MaxPool2D(pool_size=(2, 2)))
    MyModel.add(Dropout(0.25))
    MyModel.add(Flatten())
    MyModel.add(Dense(128, activation='relu'))
    MyModel.add(Dropout(0.25))
    MyModel.add(Dense(64, activation='relu'))
    MyModel.add(Dropout(0.40))
    MyModel.add(Dense(num_classes, activation='softmax'))
    MyModel.compile(loss=keras.losses.categorical_crossentropy,
                    optimizer=keras.optimizers.Adadelta(),
                    metrics=['accuracy'])
    return MyModel


def predict(filepath, model):
    sample = wav2mfcc(filepath, feature_dim_1, feature_dim_2)
    sample_reshape = sample.reshape(1, feature_dim_1, feature_dim_2, channel)
    pred = model.predict(sample_reshape)
    print("Prediction : ", pred)
    label = get_labels()[0][np.argmax(pred)]
    print(label)
    return label


model = get_model()
model.fit(x_train, y_train, batch_size=batch_size, epochs=epochs, verbose=1, validation_data=(x_test, y_test))
model.save('model.tf')
tfjs.converters.save_keras_model(model, "js_model")
pred = predict('data/sol/2018-07-28T00_08_59.024Z.wav', model=model)
print(pred)