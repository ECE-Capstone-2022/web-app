import uuid

from django.db import models
from django.urls.base import reverse

# Create your models here.

#Record model that holds data of a voice recording and allows for storage
#and search from within the database.
class Record(models.Model):
  id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
  voice = models.FileField(upload_to="records")
  name = models.CharField(max_length=50, default="")

  class Meta:
    verbose_name = "Record"
    verbose_name_plural = "Records"

  def __str__(self) -> str:
    return str(self.id)
  
  def get_absolute_url(self):
    return reverse("record_detail", kwargs={"id":str(self.id)})

  def delete(self, *args, **kwargs):
    self.voice.delete()
    super().delete(*args, **kwargs)


