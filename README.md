## About
**Lost and Found** is a web app created for the Eastern Mennonite University campus to help its students report and find their lost items. The site prioritizes ease of use and simplicity in order to make this tool available for the diverse community on our campus.
Users may:
* Browse reported lost items
* Report lost items belonging to someone else
* Report items that have been lost

This project seeks to remedy the issue of message boards and community information areas getting cluttered and making it difficult to report and find lost items by creating a specialized space for this specific purpose. 

## Tech Stack
* React + Vite
* Supabase (Postgres + Storage)
* React Router
* react-hook-form

## Features
* Browse submitted lost/found items
* View item details
* Submit a lost/found item with an image

## Future Additions
* Revamped Landing page
* Search Bar and Filters
* Claimed Item workflow
* Form confirmation screen
  
## Getting Started:
### Requirements: 
* Node.js
* npm
* Vite
* git
* Supabase account

Note: If npm fails to run the website or gives an error, try running: **npm install --include=dev**

## Supabase Setup (Required)
The Supabase Setup SQL is provided in the root file of the project in the Supabase Setup folder to accomplish the following. This project expects you to create your own Supabase project and configure:
* A table named `items` with these columns:
  * `id` (uuid or bigint, primary key)
  * `type` (text: `lost` or `found`)
  * `title` (text)
  * `description` (text, nullable)
  * `image_url` (text, nullable)
  * `contact_info` (text)
  * `current_location` (text, nullable)
  * `date_event` (date or timestamptz, nullable)
  * `event_location` (text, nullable)
  * `created_at` (timestamptz, default now())

* A Storage bucket named `lost-found-images`
* Row Level Security/policies that allow the app to read and insert items (and upload/read images), depending on your security requirements.

### Installation
```shell
#1. Clone the repository:

 git clone https://github.com/dmorales-t89/EMU-Lost-Found.git

#2. Enter the project folder: 

cd EMU-Lost-Found/lost-and-found

#3. Setup supabase database as mentioned above.

#4. At this point, you need to create a local environment containing your Supabase credentials: sudo nano .env.local

# Inside the file, paste:

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

#5. To get the url and key, go to your Supabase account, log in, and go to the setting for a new project. Under API, you can find your URL and Key, which you should put in the file.
# Save the file, and everything should be in place.

#6. Then, you can now run the site with npm: 

npm run dev

#7. The site can be accessed at localhost on a port specified by the message in your terminal (http://localhost:your-port-number/), which you can enter in place of your-port-number or ctl+left click the link provided which should look something like this but with a different port number:

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
Deployed on Vercel for now. We hope to collaborate with EMU and get it hosted by their servers before the end of the quarter. If deploying your own fork, set Vercel Root Directory to lost-and-found and add the environment variables above. https://emu-lost-found.vercel.app/

## Errors:
Though some errors were addressed in the Getting Started section, we are a small team and can’t catch everything. If you find an error, don’t be afraid to create a bug report on our GitHub page: https://github.com/dmorales-t89/EMU-Lost-Found/issues
## Contributing: 
We are not accepting external pull requests until the MVP is complete. However, you are welcome to open issues for bugs, feature ideas, or documentation improvements.
## Contact:
You may contact us at diego.moralestorres@emu.edu or ravi.holsinger@emu.edu
