from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse
from django.http.response import JsonResponse
from django.contrib import messages

from .models import Record

# Create your views here.
def record(request):

  if(request.method == "POST"):
    audioFile = request.FILES.get("audio_record")
    newRecord = Record.objects.create(voice = audioFile)
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


def record_detail(request, id):
  record = get_object_or_404(Record, id=id)
  context = {
    "page_title": "Details",
    "record": record,
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