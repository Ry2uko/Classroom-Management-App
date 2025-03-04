# Google API
SHEET_HEADER_VALUES = [
    'Date',
    'Student ID',
    'Student Name',
    'Classroom ID',
    'Classroom',
    'Attendance Status',
    'Late Time',
    'Marked By',
    'Marker ID',
]

ATTENDANCE_STATUS_VALUES = [
    'P',  # Present
    'L',  # Late (w/ late time)
    'A',  # Absent
    'E',  # Excused (Absent v2)
]

# User Model
USER_TYPES = [
    ('student', 'Student'),
    ('admin', 'Admin'),
    ('super_admin', 'Super Admin')
]

USER_ROLES = [
    ('student', 'Student'),
    ('teacher', 'Teacher'),
]

SEX_CHOICES = [
    ('M', 'Male'),
    ('F', 'Female'),
    ('O', 'Other'),
]

# Classroom Model
STRAND_CHOICES = [  # Senior High (Grades 11 & 12)
    ('STEM', 'STEM'),
    ('ABM', 'ABM'),
    ('HUMSS', 'HUMSS'),
    ('GAS', 'GAS'), # REMOVE AFTER DEBUG
]  

# Content Model
CONTENT_TYPES = [
    ('text', 'Text'),
    ('file', 'File'),  # Alternative: 'attachment' (File/URL)
    ('mixed', 'Mixed'),
]

CONTENT_CATEGORIES = [
    ('announcement', 'Announcement'),
    ('course', 'Course Material'),
    ('classroom', 'Classroom Material'),
    ('school', 'School Material'),
]

VISIBILITY_CHOICES = [
    ('school', 'School'),       # All classrooms
    ('classroom', 'Classroom'), # One classroom only (General Classroom Annnouncement)
    ('course', 'Course'),       # Course-Specific
]


# ContentAttachment Model

ATTACHMENT_TYPES = [
    ('file', 'File'),
    ('url', 'URL'),
]
