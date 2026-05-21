# Sikt

**Sikt** (Vision) is a minimalist productivity tool designed for those who value analytical rigor and spatial clarity. Built for scientists, researchers, and professionals, it moves beyond the standard "to-do list" by visualizing your day as a physical volume.

<img width="920" height="802" alt="image" src="https://github.com/user-attachments/assets/3fe54d54-a346-4ab5-b7e0-15fd2aa460ad" />


## The Philosophy
In an era of digital noise, productivity isn't about doing more—it’s about having a clear vision of your day. **Sikt** treats your time as a finite, measurable resource, helping you maintain a "day radar" that aligns your daily tasks with your actual capacity.

## Core Features
* **Cylindrical Glassware Visualization:** A high-fidelity, straight-walled beaker that represents your daily schedule.
* **Integrated Ruler Scale:** Precision time markers etched directly into the glass interface, providing an immediate sense of "where you are" in your day.
* **Intelligent Task Mapping:** Tasks are visualized as segments that stack within the beaker, automatically padded to leave a clean channel for ruler labels.
* **PWA Optimized:** Installable on any iOS or Android device with native-app behaviors, including overscroll protection and custom touch-event handling.
* **Flexible Theming:** Choose from five curated Japandi-inspired themes: *Shoji, Sumi, Suna, Wabi,* or *Asa*.

## Why I Built This
As someone who suffers from time blindness and struggles with executive function, I wanted a way to visualize how much time i have left in the day for the remainder of tasks, both as a way to organize and to prioritize. 

## Getting Started
1. **Setup:** Calibrate your "beaker" by defining your wake and bedtimes in the settings menu.
2. **Install:** For the best experience, open this site on your phone's browser and select **"Add to Home Screen"** to use Sikt as a standalone app.
3. **Optional - Syncing and backup:** Ability to sync the app with your own Google sheets, and connect it to via Google Apps Script Web App URL in the settings panel to enable real-time data backup. To enable this (**5 minutes 1 time setup** :
   - Create an empty Google Sheets document
   - Click on **Extensions** > **Apps Script** <img width="582" height="218" alt="image" src="https://github.com/user-attachments/assets/a0780609-8525-46d0-ac32-24e88323fc02" />
   - Delete the entire content of the execution log,
<img width="1307" height="347" alt="image" src="https://github.com/user-attachments/assets/90889cc7-9780-4ec7-ba15-a387bc2f26e1" />
   - Copy and paste the code found in the github named "Apps Script code" into this space and press save or Ctrl+S/Cmd+S
   - Press **Deploy** > **New Deployment**
   - Under **Select Type**, select **Web App**
   - Add the following:
       **Description**- "Sikt Deployment"
       **Execute as**- "Me"
       **Who has access** - "Anyone" - **Dont worry- as long as you dont share the link to your excel sheet explicitly with anyone, it will stay private**
   - Press **Deploy** then Copy the link under "Web App"
   <img width="743" height="519" alt="image" src="https://github.com/user-attachments/assets/26e4fd62-afd9-454c-bc3b-1301199e8258" />
   - On the Sikt app, click on **Settings** then paste the link copied above under **APPS SCRIPT WEB APP URL** field. Press Connect then close
   - The app should sync data to the Google sheets now


## Technical Details
* **Stack:** Pure HTML5, CSS3, and vanilla JavaScript (zero dependencies).
* **Storage:** Local-first architecture with automatic synchronization to Google Sheets.
* **Design:** Japandi-inspired essentialism.

---
*Built with precision for the disciplined mind.*
