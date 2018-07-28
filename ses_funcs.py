import librosa
import os
from sklearn.model_selection import train_test_split
from keras.utils import to_categorical
import numpy as np
import matplotlib.pyplot as plt

import librosa.display

DATA_PATH = "data/"


def get_labels(path=DATA_PATH):
    labels = os.listdir(path)
    label_indices = np.arange(0, len(labels))
    category = to_categorical(label_indices)
    return labels, label_indices, category


def wav2mfcc(file_path, dim1=20, dim2=60):
    # Bazi orneklerde ornek sayisi 1/3 oraninda dusurulurek islem yapiliyor wave[::3]
    # sr = 48.000/3 = 16.000, biz bu yolu tercih etmeyecegiz
    wave, sr = librosa.load(file_path, sr=None, mono=True)
    # sr = 48.000, wave ~ 48000 (1 sec record)
    mfcc = librosa.feature.mfcc(wave, sr=sr, n_mfcc=dim1)
    # shape of mfcc is (20, 89) : 89 is depend on record size
    # plt.figure(1)
    # plt.grid(True)
    # t = [i/48000 for i in range(len(wave))]
    # plt.subplot(211)
    # plt.plot(t, wave)
    # plt.subplot(212)
    # librosa.display.specshow(mfcc, x_axis='time')
    # plt.colorbar()
    # plt.title('MFCC')
    # plt.tight_layout()
    # plt.show()

    # mfcc shape is (13, X)  where x is depend on file size, it is approx 89 for 1 sec
    if dim2 > mfcc.shape[1]:
        pad_width = dim2 - mfcc.shape[1]
        mfcc = np.pad(mfcc, pad_width=((0, 0), (0, pad_width)), mode='constant')
    else:
        mfcc = mfcc[:, :dim2]
    # always with the dimension [20, 60] or [dim1, dim2]
    print("MFCC Dimensions : ", file_path, mfcc.shape)
    return mfcc


def get_train_test(dim1, dim2):
    labels, indices, hot_vector = get_labels(DATA_PATH)
    # labels = ['asagi', 'sag', 'sol', 'tikla', 'yukari']
    # [0, 1, 2, 3]
    # [
    # [1 0 0 0]
    # [0 1 0 0]
    # [0 0 1 0]
    # [0 0 0 1]
    # ]
    indices = 0
    x = []
    y = []
    for label in labels:
        wav_files = ['data/' +label+'/' + wavfile for wavfile in os.listdir('data/'+label)]
        for wav_file in wav_files:
            mfcc = wav2mfcc(wav_file, dim1, dim2)
            x.append(mfcc)
            vec = hot_vector[indices]
            y.append(vec)
            print("File , hot ", wav_file, vec)
        indices = indices + 1
    x = np.array(x)
    y = np.array(y)

    return train_test_split(x, y, test_size=int(len(x)*0.1), shuffle=True)
