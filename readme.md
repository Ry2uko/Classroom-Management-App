```
THIS PROJECT IS CURRENTLY UNDERGOING REMAKE 
```


How to run the application:
1. Clone the repository: 
```
git clone https://github.com/Ry2uko/Classroom-Management-App.git
```

2. Creating Google API credentials using a service account
   - Create a new Google account
   - Log in to [Google Cloud Console](https://console.cloud.google.com) and create a new project
   - Go to APIs & Services on the navigation menu and select "Enabled APIs & services". Search "Google Drive API" and "Google Sheets API", then enable them.
   - After that, go to the "Credentials" tab
   - Create credentials then select "Service account"
   - After creating a service account, from the credentials screen, select your service account. Go to the keys tab and "Add key", then proceeding to create a new key (JSON). 
   - The JSON file will automatically be downloaded, which is your credentials. You can rename this file as `credentials.json`, then put in the project directory.
3. Creating the main Google Drive folder and Google Sheets spreadsheet
	- First, copy the email from your service account (e.g. `<account>@<project>.iam.gserviceaccount.com`)
	- From a separate Google account, open [Google Drive](https://drive.google.com/drive/), create a new folder then share it with your service account.
	- Copy the folder id (you can see the folder id by opening the created folder, and splicing it from the url: `https://drive.google.com/drive/folders/<folder_id>?resourcekey=...`)
	- Do the same with [Google Sheets](https://docs.google.com/spreadsheets/u/0/?pli=1), and share with your service account, then copy the spreadsheet id from the url: `https://docs.google.com/spreadsheets/d/<spreadsheet_id>/edit?gid=0#gid=0`
	- This folder and spreadsheet is where files from the classroom management app and attendance will be stored
4. Setting the environment variables
	- Create a `.env` file using the `.env.sample` template and paste the folder id and spreadsheet id from earlier
5. Run the following commands (`/backend`)
```
pip install -r requirements.txt
python manage.py makemigrations api
python manage.py migrate
python manage.py runserver
```
6. Run the following commands (`/frontend`)
```
npm install
npm start
```
