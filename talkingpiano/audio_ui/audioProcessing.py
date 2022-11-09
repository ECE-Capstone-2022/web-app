import os
import matplotlib.pyplot as plt
import numpy as np
from scipy import signal
from scipy.fftpack import fft, ifft
from scipy.io import wavfile

# from scipy.io.wavfile import read as wav_to_numpy
from IPython import display



def fft_plot(audio, sample_rate):
  N = len(audio)    # Number of samples
  y_freq = fft(audio)
  domain = len(y_freq) // 2
  X = np.linspace(0, sample_rate//2, N//2)
  Y = np.abs(y_freq[:domain])
  plt.plot(X, Y)
  print(len(X), len(Y))
  plt.xlabel("Frequency [Hz]")
  plt.ylabel("Frequency Amplitude |X(t)|")
  plt.title("Frequency Response within 1 second of audio recording")
  return plt.savefig('media/graphs/o_freq.png')


def make_spectrogram(audio, sample_rate):
  plt.clf()
  plt.specgram(audio, Fs=sample_rate)
  plt.title("Original Audio Spectrogram")
  plt.ylabel("Frequency [Hz]")
  plt.xlabel("Time [seconds]")
  cb = plt.colorbar()
  cb.set_label("Intensity [dB]")
  return plt.savefig('media/graphs/o_spectro.png')


def rescale(arr, factor=2):
  n = len(arr)
  return np.interp(np.linspace(0, n, factor*n+1), np.arange(n), arr)

def fft_over_piano(audio, sample_rat, PIANO_FILTERS):
  fig, ax = plt.subplots()
  N = len(audio)    # Number of samples
  y_freq = fft(audio)
  domain = len(y_freq) // 2
  Y = np.abs(y_freq[:domain])
  X = np.arange(0, 5000, 0.001)
  Y = rescale(Y, factor=int(len(X)/len(y_freq)))
  Y.resize(len(X))
  try:
    assert(len(X) == len(Y))
  except:
    print(f'len(X) = {len(X)}, len(Y) = {len(Y)}')

  ax.plot(X, np.abs(Y)*PIANO_FILTERS)
  ax.plot(X, np.abs(Y), alpha=0.3)
  plt.xlabel("Frequency [Hz]")
  plt.ylabel("Frequency Amplitude |X(t)|")
  plt.title("Frequency Response within First Second of Audio\n over the Frequencies of Piano Keys")
  return plt.savefig('media/graphs/fin_freqLayer.png')



def mainFunc(fileName):

  PIANO_KEY_FREQUENCIES = []
  PIANO_FILTERS = []
  if 'audio_ui/static/key_frequencies.txt' not in os.listdir():
    with open('audio_ui/static/key_frequencies.txt', 'w') as f:
      for n in range(1,89):
        freq = (2**((n-49)/12))*440
        if (n != 88):
          text = "{:.3f}\n".format(freq)
        else:
          text = "{:.3f}".format(freq)
        if text != '': f.write(text)
      f.close()

  with open('audio_ui/static/key_frequencies.txt', 'r') as f:
      for n in f.read().split('\n'):
        PIANO_KEY_FREQUENCIES.append(float(n))
      
      fig, ax = plt.subplots()
      ax.set_xlabel('Frequency [Hz]')
      ax.set_ylabel('Frequency Amplitude |X(t)| [dB]')

      X = np.arange(0, 5000, 0.001)
      Y = np.zeros(len(X))

      seen = set()
      for k in PIANO_KEY_FREQUENCIES:
        # TODO: There is a known issue where the top 10 frequencies are not being
        # found. This is not a pressing matter because we're only using the top 69
        # keys. To see this, uncomment the line under 'except'
        try:
          i = np.where(X == k)[0][0]
        except:
          # print(f'Key frequency {k} was not found')
          pass
        if i in seen: continue
        seen.add(i)
        impluse = signal.unit_impulse(len(X), i)
        Y += impluse
      PIANO_FILTERS = Y
  f.close()

  audio_path = "media/records/" + fileName

  #CREATE TIME SERIES GRAPH

  sample_rate, audio_time_series = wavfile.read(audio_path)
  time = np.linspace(0, len(audio_time_series) / sample_rate, num=len(audio_time_series))
  plt.plot(time, audio_time_series)
  plt.title('Recorded Audio Time Series')
  plt.xlabel("time [seconds]")
  plt.ylabel("Amplitude |x(t)|")
  plt.savefig("media/graphs/o_time.png")



  single_sample_data = audio_time_series[:sample_rate]


  fft_plot(single_sample_data, sample_rate)


  make_spectrogram(audio_time_series, sample_rate)


  fft_over_piano(single_sample_data, sample_rate, PIANO_FILTERS)