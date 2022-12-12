from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse
from django.http.response import JsonResponse
from django.contrib import messages
import os

from . import audioProcessing
from . import scheduler_test

from .PianoPi import piano_pi
from .PianoPi import scheduler

#C:\Users\jwama\Desktop\Masters\Fall\Capstone\WebApp\talkingpiano\audio_ui\views.py

from .models import Record


# Create your views here.
def record(request):

  if(request.method == "POST"):
    audioFile = request.FILES.get("audio_record")
    fileName = request.POST['fileName']
    newRecord = Record.objects.create(voice = audioFile, name = fileName)
    newRecord.save()
    messages.success(request, "Successfully added new recording!")
    return JsonResponse(
      {
        "success": True,
      }
    )

  context = {
    "page_title": "Record Audio"
  }
  return render(request, "audio_ui/record.html", context)


def getArray(request):
  if(request.method == "POST"):
    #currPath = os.getcwd('C:\Users\jwama\Desktop\Masters\Fall\Capstone\WebApp\talkingpiano\media\records\marco_speech_18_500.wav')
    
    print("Generating piano note matrix")
    #if(pianoPiClass != 0):
    #  noteArray = pianoPiClass.generate_piano_note_matrix()
    noteArray = scheduler.parse_input("out/"+ tsvFileName +".tsv")
    #else:
    #  print("ERROR, PianoPi Class not set yet")
    #  noteArray = []
    print("Finished")
    return JsonResponse(
      {
        "data":noteArray
      }
  )



def record_detail(request, fileName):
  record = get_object_or_404(Record, name=fileName)
  print("Instantiating Piano Pi...")
  global pianoPiClass
  global tsvFileName
  tsvFileName = fileName
  pianoPiClass = piano_pi.PianoPi(file_path = 'C:/Users/jwama/Desktop/Masters/Fall/Capstone/WebApp/talkingpiano/media/records/' + fileName + '.wav', uuid=fileName, play_rate=15)
  print("Done creating PianoPi")
  print("Creating TSV...")
  pianoPiClass.generate_tsv()
  print("TSV Made")
  

  #noteArray = scheduler_test.identity_matrix()
  #noteArray = scheduler_test.sharp_identity_matrix()

  context = {
    "page_title": "Details",
    "record": record,
    "param" : fileName,
  }

  return render(request, "audio_ui/record_detail.html", context)


#initial home index page for routing to others
def home(request):
  if(request.method == "POST"):
    record = get_object_or_404(Record, id=request.POST['id'])
    record.delete()
    return JsonResponse(
      {
        "success":True
      }
    )
  records = Record.objects.all()
  context = {
    "page_title": "Home Page", 
    "records" : records,
  }
  return render(request, "audio_ui/home.html", context)



#initial home index page for routing to others
def past_records(request):
  if(request.method == "POST"):
    record = get_object_or_404(Record, id=request.POST['id'])
    record.delete()
    return JsonResponse(
      {
        "success":True
      }
    )
  records = Record.objects.all()
  context = {
    "page_title": "Past Recordings", 
    "records" : records,
  }
  return render(request, "audio_ui/past_records.html", context)


#test platform with RecordRTC 
def record_test(request):
  context = {

  }
  return render(request, "audio_ui/record_test.html", context)