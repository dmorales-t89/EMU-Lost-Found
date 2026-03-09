## About
**Lost and Found** is a web app created for the Eastern Mennonite University campus to help its students report and find their lost items. The site prioritizes ease of use and simplicity in order to make this tool available for the diverse community on our campus.
Users may:
* Browse reported lost items
* Report lost items belonging to someone else
* Report items that have been lost

This project seeks to remedy the issue of message boards and community information areas getting cluttered and making it difficult to report and find lost items by creating a specialized space for this specific purpose. 

## Getting Started:
### Requirements: 
* Node.js
* npm
* Vite
* git
* Supabase account

Note: If npm fails to run the website or gives an error, try running: **npm install --include=dev**

### Installation
```shell
#1. Clone the repository:

 git clone https://github.com/dmorales-t89/EMU-Lost-Found.git

#2. Enter the project folder: 

cd EMU-Lost-Found/lost-and-found

#3. At this point, you need to create a local environment containing your Supabase credentials: sudo nano .env.local

# Inside the file, paste:

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

#4. To get the url and key, go to your Supabase account, log in, and go to the setting for a new project. Under API, you can find your URL and Key, which you should put in the file.
# Save the file, and everything should be in place.

#5. Then, you can now run the site with npm: 

npm run dev

#6. The site can be accessed at localhost on a port specified by the message in your terminal (http://localhost:your-port-number/), which you can enter in place of your-port-number or ctl+left click the link provided which should look something like this but with a different port number:

-> Local:   http://localhost:5175/

#Note: For security, it is recommended that you terminate the web app in the terminal when you #are finished using it: ctrl+c
```
### Architecture: 
[Document](https://docs.google.com/document/d/1FPnus3CT5DbnmzhFA_A6gmJb5foQV6MxHKfxlVO_Uu4/edit?tab=t.0#heading=h.bx4pdz809tx6)
## Frontend Guide:
### Routing Table
| Name | Location | Description |
| --- | --- | --- |
| HomePage | / | Landing page with information |
| LostItemsPage | /lost-items | Page to browse and displayed lost and found items |
| ItemDetailPage | /lost-items/:id | Displays more information and links concerning the selected item |
| LostSubmitForm | /lost-submit-form | Form to submit lost or found items and post them to the LostItemsPage |

The style is made to closely align with the Eastern Mennonite University website for user clarity and to give a sense of familiarity and pride.

## Deployment: 
The app is currently hosted locally for development. When a production URL is available, it will be announced here.
## Errors:
Though some errors were addressed in the Getting Started section, we are a small team and can’t catch everything. If you find an error, don’t be afraid to create a bug report on our GitHub page: https://github.com/dmorales-t89/EMU-Lost-Found/issues
## Contributing: 
We are not accepting external pull requests until the MVP is complete. However, you are welcome to open issues for bugs, feature ideas, or documentation improvements.
## Contact:
You may contact us at diego.moralestorres@emu.edu or ravi.holsinger@emu.edu
