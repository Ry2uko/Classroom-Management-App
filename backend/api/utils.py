# Utility Functions for handling with external API (Google Cloud)
# Google Sheets API & Google Drive API
# NOTE: BASED ON STRAND SYSTEM FOR SENIOR HIGH. REQUIRES FULL APPLICATION ADJUSTMENT IF JHS IS INCLUDED.

from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2 import service_account
from datetime import datetime
from .constants import SHEET_HEADER_VALUES
import pytz
import random
import string

# General Utilities

def generate_unique_password(pin_length=4):
    """ Generates a unique password with this format: sgat<PIN>. """

    return 'sgat' + ''.join(random.choices(string.digits, k=pin_length))


# Service Account (Helper Functions)

class ServiceAccount():
    """ Service account for Google API Client. """

    def __init__(self, credentials_path):
        # Hint: get credentials from Google Cloud Console as Service Account
        scope = [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
        ]
        credentials = service_account.Credentials.from_service_account_file(
            filename=credentials_path,
            scopes=scope,
        )
        
        self.sheets_service = build('sheets', 'v4', credentials=credentials)
        self.drive_service = build('drive', 'v3', credentials=credentials)


def get_spread_range(n, n_y='1'):
    """ Helper function for create_classroom for converting spreadsheet range. """

    # Convert a number to a capitalized letter like Excel columns (1 → A, 26 → Z, 27 → AA)
    n_end_range=''
    while n > 0:
        n -= 1
        n_end_range = chr(n % 26 + 65) + n_end_range
        n //= 26
    
    return f'A{n_y}:{n_end_range}{n_y}'


def create_sheet(sheet_name, sheets_service, spreadsheet_id):
    """ Helper function for creating a sheet in the provided spreadsheet. """

    results_data = {}

    try:
        # Check if sheet exists
        results = sheets_service.spreadsheets().get(
            spreadsheetId=spreadsheet_id
        ).execute()

        sheets = results.get('sheets', [])
        for sheet in sheets:
            if sheet['properties']['title'] == sheet_name:
                return { 'error': 'sheet already exists' }

        # Create sheet
        requests = [{
            'addSheet': {
                'properties': {
                    'title': sheet_name,
                },
            },
        }]

        batch_update_request = { 'requests': requests }
        sheet = sheets_service.spreadsheets().batchUpdate(
            spreadsheetId=spreadsheet_id,
            body=batch_update_request,
        ).execute()
        
        print(f"Sheet '{sheet_name}' successfully created.")
        results_data['sheet_id']= str(sheet['replies'][0]['addSheet']['properties']['sheetId'])

    except Exception as e:
        return { 'error': str(e) }

    return results_data


def delete_sheet(sheet_name, sheets_service, spreadsheet_id):
    results_data = { 'success': True }

    try:
        # Fetch sheet id (if it exists)
        results = sheets_service.spreadsheets().get(
            spreadsheetId=spreadsheet_id,
        ).execute()
        sheets = results.get('sheets', [])

        sheet_id = None
        for sheet in sheets:
            if sheet['properties']['title'] == sheet_name:
                sheet_id = sheet['properties']['sheetId']
                break
        if sheet_id is None:
            return { 'error': 'sheet not found' }
        
        # Delete sheet
        batch_update_request = {
            'requests': [{
                'deleteSheet': {
                    'sheetId': sheet_id,
                },
            }]
        }
        sheets_service.spreadsheets().batchUpdate(
            spreadsheetId=spreadsheet_id,
            body=batch_update_request,
        ).execute()

        print(f"Sheet '{sheet_name}' successfully deleted.")
        
    except Exception as e:
        return { 'error': str(e) }
    
    return results_data


def create_folder(folder_name, drive_service, parent_folder_id):
    """ Helper function for creating a folder in the provided parent folder. """

    results_data = {}

    try:
        # Check if folder exists
        results = drive_service.files().list(
            q=f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false \
            and '{parent_folder_id}' in parents",
            fields="files(id, name)",
        ).execute()

        folders = results.get('files', [])
        if folders:
            return { 
                'error': 'folder already exists',
                'folder_id': folders[0]['id'],
            }
        
        # Create folder
        file_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': [ parent_folder_id ],
        }

        folder = drive_service.files().create(
            body=file_metadata,
            fields='id, webViewLink'
        ).execute()

        results_data['folder_id'] = folder['id']
        results_data['folder_webViewLink'] = folder['webViewLink']
        print(f"Folder '{folder_name}' successfully created.")

    except Exception as e:
        return { 'error': str(e) }

    return results_data


def delete_folder(folder_name, drive_service, parent_folder_id):
    """ Helper function for deletign a folder in teh provided parent folder. """

    results_data = { 'success': True }

    try:
        # Check if folder exists
        results = drive_service.files().list(
            q=f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' \
                and trashed=false and '{parent_folder_id}' in parents",
            fields="files(id, name)",
        ).execute()
        folders = results.get('files', [])

        if not folders:
            return { 'error': 'folder not found' }

        for folder in folders:
            drive_service.files().delete(
                fileId=folder['id']
            ).execute()

        print(f"Folder '{folder_name}' successfully deleted.")

    except Exception as e:
        return { 'error': str(e) }  

    return results_data


# Service Account

def create_classroom(classroom_name_full, drive_service, root_folder_id, sheets_service, spreadsheet_id):
    """ Set up classroom Google Drive folder and Google Docs sheet. """

    results_data = {}

    # Create classroom folder
    results = create_folder(classroom_name_full, drive_service, root_folder_id)
    if 'error' in results:
        print(f'Error creating folder: {results['error']}.')
        return {}

    # Create grade level folder if it doesn't exist
    grade_level = int(classroom_name_full.split('-')[0])
    grade_folder_name = f'Grade {grade_level}'
    grade_folder_results = create_folder(grade_folder_name, drive_service, root_folder_id)
    if 'error' in grade_folder_results and grade_folder_results['error'] != 'folder already exists':
        print(f'Error creating folder: {grade_folder_results['error']}.')
        return {}   

    # Create classroom sheet
    sheets_result = create_sheet(classroom_name_full, sheets_service, spreadsheet_id)
    if 'error' in sheets_result:
        print(f'Error creating sheet: {sheets_result['error']}')
        return {}

    # Create header row
    header_values = [ SHEET_HEADER_VALUES ]
    range_name = f"'{classroom_name_full}'!{get_spread_range(len(SHEET_HEADER_VALUES))}"
    body = { 'values': header_values }

    sheets_service.spreadsheets().values().update(
        spreadsheetId=spreadsheet_id,
        range=range_name,
        valueInputOption='RAW',
        body=body,
    ).execute()


    results_data['classroom_folder_id'] = results['folder_id']
    results_data['grade_folder_id'] = grade_folder_results['folder_id']
    results_data['sheet_id'] = sheets_result['sheet_id']

    return results_data


def delete_classroom(classroom_name_full, drive_service, root_folder_id, sheets_service=None, spreadsheet_id=None):
    """ Delete classroom folders and spreadsheets from Drive and Docs (Sheets). """
    
    # Delete classroom folder
    results = delete_folder(classroom_name_full, drive_service, root_folder_id)
    if 'error' in results:
        print(f"Error deleting folder: {results['error']}.")
        return False

    if classroom_name_full.split()[0].lower() != 'grade':
        # Delete classroom attendance sheet
        delete_sheet(classroom_name_full, sheets_service, spreadsheet_id)
    
    return True


def create_course(course_name, drive_service, classroom_folder_id):
    """ Create folder inside Google Drive classroom folder. """

    results_data = {}
    
    # Create course folder
    results = create_folder(course_name, drive_service, classroom_folder_id)
    if 'error' in results:
        print(f"Error creating folder: {results['error']}.")
        return {}

    results_data['course_folder_id'] = results['folder_id']
    print(f'Folder for course {course_name} successfully created.')

    return results_data


def delete_course(course_name, drive_service, classroom_folder_id):
    """ Delete course folder. """

    # Delete classroom folder
    results = delete_folder(course_name, drive_service, classroom_folder_id)
    if 'error' in results:
        print(f"Error deleting folder: {results['error']}.")
        return False


    print(f"Folder '{course_name}' successfully deleted.")
    return True


# Drive V3

def upload_file(service, file_path, file_name, mime_type, folder_id):
    """ Upload file to a Google Drive folder given folder id. """

    file_metadata = {
        'name': file_name, 
        'mimeType': mime_type,
        'parents': [ folder_id ],
    }

    try: 
        media = MediaFileUpload(file_path, mimetype=mime_type)
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, webViewLink, webContentLink'
        ).execute()
    except Exception as e:
        print(f'Error uploading file: {e}')
        return {}

    file_data = {
        'id': file['id'],
        'webViewLink': file['webViewLink'],
        'webContentLink': file['webContentLink'],
    }

    print(f"File '{file_name}' uploaded successfully to folder '{folder_id}'.")
    print(file_data)
    return file_data


def delete_file(service, file_id):
    """ Delete file from a Google Drive folder given folder and file id. """

    try:
        service.files().delete(
            fileId=file_id
        ).execute()
        print(f"File with ID '{file_id}' deleted successfully.")

    except Exception as e:
        print(f'Error deleting file: {e}')
        return 


# Sheets V4

def parse_date(date_input):
    """ Helper function for converting date input to a datetime object. """
    if date_input is None:
        return None
    
    if isinstance(date_input, datetime):
        return date_input.replace(tzinfo=pytz.UTC)

    try: 
        return datetime.strptime(date_input, '%Y-%m-%d').replace(tzinfo=pytz.UTC)
    except ValueError:
        raise ValueError(f"Invalid date format: {date_input}.")


def get_classroom_attendance(service, spreadsheet_id, sheet_name, start_date=None, end_date=None):
    """ Get all students' attendance details of a classroom given date range. """

    try:
        start_date = parse_date(start_date)
        end_date = parse_date(end_date)

        if start_date and end_date and start_date > end_date:
            raise ValueError(f'Invalid data range: start date cannot be later than end date.')

        range_name = f"'{sheet_name}'!{get_spread_range(len(SHEET_HEADER_VALUES), '')}"
        result = service.spreadsheets().values().get(
            spreadsheetId=spreadsheet_id,
            range=range_name,
        ).execute()

        rows = result.get('values', [])[1:]  # Ignore header row
        if not rows:
            print(f"Error fetching attendance: No attendance data found for classroom '{sheet_name}'.")
            return []

        filtered_rows = []
        for row in rows:
            try: 
                record_date = parse_date(row[0])

                """
                Date Filtering:
                - No start date & No end date → Returns all records
                - Start date only → Returns all records from that date onward
                - End date only → Returns all records up to that date
                - Both start & end → Returns records within that range
                """

                if (
                    (not start_date and not end_date) or
                    (start_date and end_date and start_date <= record_date <= end_date) or
                    (start_date and not end_date and start_date <= record_date) or
                    (not start_date and end_date and record_date <= end_date)
                ):
                    row[1] = int(row[1])  # student_id
                    row[3] = int(row[3])  # classroom_id
                    row[8] = int(row[8])  # marker_id
                    filtered_rows.append(row)
            except Exception as e:
                print(f'Skipping row due to error: {e}')

        return filtered_rows

    except Exception as e:
        print(f'Error fetching attendance: {e}')
        return []


def get_student_attendance(service, spreadsheet_id, sheet_name, student_id, start_date=None, end_date=None):
    """ Get student attendance details given date range. """
    
    rows = get_classroom_attendance(service, spreadsheet_id, sheet_name, start_date, end_date)
    return [row for row in rows if int(row[1]) == int(student_id)]


def mark_student_attendance(service, spreadsheet_id, sheet_name, attendance_data):
    """ Mark student attendance on current day (or custom). """

    try:
        range_name = f"'{sheet_name}'!{get_spread_range(len(SHEET_HEADER_VALUES), '2')}"
        values = [  # Preseve order
            [
                attendance_data['date'],
                int(attendance_data['student_id']),
                attendance_data['student_name'],
                int(attendance_data['classroom_id']),
                attendance_data['classroom'],
                attendance_data['attendance_status'],
                attendance_data['late_time'],
                attendance_data['marked_by'],
                int(attendance_data['marker_id']),
            ],
        ]
        body = {
            'values': values,
        }

        service.spreadsheets().values().append(
            spreadsheetId=spreadsheet_id,
            range=range_name,
            valueInputOption='RAW',
            insertDataOption='INSERT_ROWS',
            body=body,
        ).execute()

        print(f"Attendance updated for '{attendance_data['student_name']}'.")
        return True
    
    except Exception as e:
        print(f'Error marking attendance: {e}')
    
    return False

