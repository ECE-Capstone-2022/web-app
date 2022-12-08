from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse
from django.http.response import JsonResponse
from django.contrib import messages

from . import audioProcessing

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


def record_detail(request, fileName):
  record = get_object_or_404(Record, name=fileName)
  #audioProcessing.mainFunc(fileName + '.wav')
  #Test arrays of which notes to press
  testArray1 = [0] * 88
  testArray2 = [0] * 88
  testArray3 = [0] * 88
  testArray4 = [0] * 88
  testArray5 = [0] * 88

  #array 1
  testArray1[10] = 1
  testArray1[15] = 1
  testArray1[20] = 1
  testArray1[25] = 1
  testArray1[30] = 1

  #array 2
  testArray2[5] = 1
  testArray2[12] = 1
  testArray2[19] = 1
  testArray2[26] = 1
  testArray2[33] = 1

  #array 3
  testArray3[5] = 1
  testArray3[12] = 1
  testArray3[25] = 1
  testArray3[30] = 1
  testArray3[38] = 1

  #array 4
  testArray4[60] = 1
  testArray4[65] = 1
  testArray4[70] = 1
  testArray4[75] = 1
  testArray4[80] = 1

  #array 5
  testArray5[10] = 1
  testArray5[15] = 1
  testArray5[20] = 1
  testArray5[25] = 1
  testArray5[30] = 1
  testArray5[35] = 1
  testArray5[40] = 1
  testArray5[45] = 1
  testArray5[50] = 1
  testArray5[55] = 1
  testArray5[60] = 1
  testArray5[65] = 1
  testArray5[70] = 1
  testArray5[75] = 1
  testArray5[80] = 1


  #noteArray = [testArray1, testArray2, testArray3, testArray4, testArray5]
  noteArray = [[0],[1],[2],[3],[4],[5]]
  
  context = {
    "page_title": "Details",
    "record": record,
    "param" : fileName,
    "noteArray": str(noteArray).replace(" ", ""),
  }

  return render(request, "audio_ui/record_detail.html", context)


#initial home index page for routing to others
def index(request):
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
  return render(request, "audio_ui/index.html", context)


#test platform with RecordRTC 
def record_test(request):
  context = {

  }
  return render(request, "audio_ui/record_test.html", context)