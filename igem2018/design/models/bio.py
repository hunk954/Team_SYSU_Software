# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

class Parts(models.Model):

    # User who add this part.
    Username = models.CharField(max_length = 32, default="Unknown")
    
    # Is this a public part?
    IsPublic = models.BooleanField(default = True)

    Role = models.CharField(max_length = 20, default = "sequenceFeature")
    Name = models.CharField(max_length = 50, unique = True, db_index = True)
    secondName = models.TextField(default="Unknow")
    Description = models.TextField()
    Length = models.IntegerField(default = 0) # 0输出Unknow
    Part_rating = models.IntegerField(default = 0)#0输出Unknow
    Type = models.CharField(max_length = 20)
    Safety = models.IntegerField(default = -1) #负数的时候需要输出Unknow
    # Scores = models.FloatField(default=-1.0) # 负数的时候需要输出Unknow
    Release_status = models.CharField(max_length = 100, default = "To be add")
    Twins = models.CharField(max_length = 500, default = "To be add")
    Sample_status = models.CharField(max_length = 50, default = "To be add")
    Part_results = models.CharField(max_length = 16, default = "To be add")
    Use = models.CharField(max_length = 50, default = "To be add")
    Group = models.CharField(max_length = 100, default = "To be add")
    Author = models.CharField(max_length = 256, default = "To be add")
    DATE = models.CharField(max_length = 10, default = "To be add")
    Distribution = models.TextField(default = "To be add")
    Sequence = models.TextField()
    # No idea what it is. It seems usesless
    Parameter = models.TextField(default = "")

    def __str__(self):
        return "%s : %s" % (self.Name, self.Description)

class SubParts(models.Model):
    parent = models.ForeignKey('Parts', related_name = 'parent_name', on_delete = models.CASCADE)
    child = models.ForeignKey('Parts', related_name = 'child_name', on_delete = models.CASCADE)

    def __str__(self):
        return "%s contains %s" % (self.parent.Name, self.child.Name)

class PartsInteract(models.Model):
    parent = models.ForeignKey('Parts', related_name = 'parent_part', on_delete = models.CASCADE)
    child = models.ForeignKey('Parts', related_name = 'child_part', on_delete = models.CASCADE)
    InteractType = models.CharField(max_length=10, default="normal")
    Score = models.FloatField(default=-1.0) #负数的时候需要输出Unknow
    def __str__(self):
        return "%s contains %s" % (self.parent.Name, self.child.Name)

class Chassis(models.Model):
    name = models.CharField(max_length = 256, unique = True)
    data = models.TextField(default='')
    def __str__(self):
        return "%s" % (self.name)

class Circuit(models.Model):
    Name = models.CharField(max_length = 50, unique = False)
    Description = models.CharField(max_length = 500)
    Comment = models.CharField(max_length = 500, null = True, default="None") #Denote the comment when update
    Author = models.ForeignKey('User', on_delete = models.CASCADE, null = True, related_name='%(class)s_requests_author')
    Editor = models.ForeignKey('User', on_delete = models.CASCADE, null = True, related_name='%(class)s_requests_editor')
    Chassis = models.ForeignKey('Chassis', on_delete = models.SET_NULL, null=True)
    Update_time = models.DateTimeField(auto_now=True, null=True)
    def __str__(self):
        return "%s" % self.Name

class CircuitParts(models.Model):
    Part = models.ForeignKey('Parts', on_delete = models.CASCADE)
    Circuit = models.ForeignKey('Circuit', on_delete = models.CASCADE)
    X = models.IntegerField()
    Y = models.IntegerField()

    def __str__(self):
        return "%s of %s" % (self.Part.Name, self.Circuit.Name)

class CircuitLines(models.Model):
    Start = models.ForeignKey('CircuitParts', related_name = 'Start', on_delete = models.CASCADE)
    End = models.ForeignKey('CircuitParts', related_name = 'End', on_delete = models.CASCADE)
    Type = models.CharField(max_length = 20)

    def __str__(self):
        return "%s to %s of type %s" % (self.Start.Part.Name, self.End.Part.Name, self.Type)

class CircuitDevices(models.Model):
    Circuit = models.ForeignKey('Circuit', on_delete = models.CASCADE)
    Subparts = models.ManyToManyField(CircuitParts)
    X = models.IntegerField(default = 0)
    Y = models.IntegerField(default = 0)
    
class CircuitCombines(models.Model):
    Circuit = models.ForeignKey('Circuit', on_delete = models.CASCADE, related_name = "Father")
    Father = models.ForeignKey('CircuitParts', on_delete = models.CASCADE, related_name = "Sons")
    Sons = models.ManyToManyField(CircuitParts)

class Protocol(models.Model):
    Circuit = models.OneToOneField('Circuit', on_delete=models.CASCADE)
    Title = models.CharField(max_length=30)
    Description = models.TextField()

class Step(models.Model):
    Father = models.ForeignKey('Protocol', on_delete=models.CASCADE)
    Title = models.CharField(max_length=30)
    Body = models.TextField()
    Order = models.IntegerField()
    class Meta:
        ordering = ['Order']

class Authorities(models.Model):
    User = models.ForeignKey('User', on_delete=models.CASCADE)
    Circuit = models.ForeignKey('Circuit', on_delete=models.CASCADE)
    Authority = models.CharField(max_length=10) # string field: 'read', 'write'

class RealtimeDesign(models.Model):
    Circuit = models.OneToOneField('Circuit', on_delete=models.CASCADE)
    Design = models.TextField()

class LiveCanvas(models.Model):
    Design = models.TextField()
    Path = models.TextField()
    Type = models.TextField(default='draw')
    Order = models.BigAutoField(primary_key=True)
