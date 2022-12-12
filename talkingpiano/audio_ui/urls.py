from django.urls import path

from . import views

app_name = "audio_ui"

urlpatterns = [
    path('', views.home, name='home'),
    path('record', views.record, name='record'),
    path('past_records', views.past_records, name='past_records'),
    path('record_detail/getArray', views.getArray, name='getArray'),
    path('record_detail/<fileName>', views.record_detail, name='record_detail'),
    path('record_test', views.record_test, name='record_test'),
]