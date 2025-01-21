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
]  

# Content Model
CONTENT_TYPES = [
    ('text', 'Text'),
    ('file', 'File'),
    ('mixed', 'Mixed'),
]

VISIBILITY_CHOICES = [
    ('school', 'School'),
    ('classroom', 'Classroom'),
]

# File Model
FILE_TYPES = [
    ('pdf', 'PDF Document'),
    ('docx', 'Word Document'),
    ('pptx', 'Powerpoint Presentation'),
    ('xlsx', 'Excel Spreadsheet'),
    ('jpg', 'JPEG Image'),
    ('png', 'PNG Image'),
    ('mp4', 'MP4 Video'),
    ('other', 'Other File Type'),
]

MIME_TYPES = [
    ('application/pdf', 'PDF Document'),
    ('application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Word Document'),
    ('application/vnd.openxmlformats-officedocument.presentationml.presentation', 'PowerPoint Presentation'),
    ('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Excel Spreadsheet'),
    ('image/jpeg', 'JPEG Image'),
    ('image/png', 'PNG Image'),
    ('video/mp4', 'MP4 Video'),
]