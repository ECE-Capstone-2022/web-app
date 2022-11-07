from django.urls import path

from . import views

app_name = "audio_ui"

urlpatterns = [
    path('', views.index, name='index'),
    path('record', views.record, name='record'),
    path('record_detail', views.record_detail, name='record_detail'),
    path('record_test', views.record_test, name='record_test'),
]