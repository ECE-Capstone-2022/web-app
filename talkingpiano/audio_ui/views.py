from django.shortcuts import render
from django.http import HttpResponse


# Create your views here.
def index(request):
  return HttpResponse("Hello talking piano user, this is our first page")


def woah(request):
  return HttpResponse("WOAH there partner")