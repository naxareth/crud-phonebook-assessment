# Paper Directory UI Design Brief

## *Phonebook assessment visual and interaction plan*

Design the phonebook as a personal address book: warm paper, dark ink, alphabetical groupings, and neatly ruled entries. The interface should feel distinctive through typography, spacing, and structure while keeping contact creation, viewing, editing, and deletion easy to demonstrate.

# **Visual direction**

Use a restrained editorial style. A small uppercase Directory label sits above the serif title Your people. Contact names carry the strongest emphasis, phone numbers align consistently, and email addresses appear beneath them in quieter text. Thin horizontal rules organize the content.

| Element | Specification |
| :---- | :---- |
| Page background | Warm ivory  \#F5F1E8 |
| Primary text | Ink charcoal  \#252820 |
| Primary accent | Forest green  \#365744 |
| Dividers | Muted paper gray  \#D8D2C6 |
| Typography | Serif page heading; clean sans-serif for contact details and controls. |
| Shape and depth | Mostly square corners, thin rules, and minimal shadows. |

Use the pale border color for decorative separators. Form boundaries, secondary text, and focus indicators must remain clearly visible; verify contrast during implementation.

# **Main screen composition**

Place Add a contact at the top right. Below the title and divider, place a search field on the left and the entry count on the right. Group the contact list alphabetically with a clear letter heading above each group.

Each desktop row contains the contact name, phone number with email below, and visible Edit and Delete actions. Keep action positions consistent across rows. Display the count as 12 entries rather than a dashboard statistic.

# **Character and restraint**

The address-book structure provides the identity. Avoid gradients, oversized rounded cards, random icons, dashboard statistics, stock illustrations, and decorative animation. Use subtle hover and keyboard focus states. Do not add visual elements that imply unavailable functionality.

# **Scope and priorities**

Build the visual theme around the required CRUD flow first. Alphabetical grouping establishes the theme without extra controls. Search and clickable alphabet filters are optional enhancements; omit their controls until they work. This brief changes the interface direction while retaining the agreed React, Express, and Supabase stack.

# **Layout and responsive behavior**

Desktop: use one generous content column with aligned contact rows. Keep the page title and primary action easy to locate. Add an alphabet strip only if the optional filtering behavior is implemented.

Mobile: stack each contact’s name, phone number, email, and actions vertically. Preserve the letter groupings and thin dividers. Let the top action and search area wrap naturally, avoid horizontal scrolling, and provide comfortable touch targets.

# **Contact form panel**

Use one reusable side panel styled as an address-book entry. Give it an ivory background, generous spacing, visible input borders, and the title New entry or Edit entry. On narrow screens, expand it to the available width.

| Field or control | Behavior |
| :---- | :---- |
| Full name | Required; show a clear label and inline validation. |
| Phone number | Required; preserve leading zeros and the international \+ prefix. |
| Email address | Optional; validate the format when provided. |
| Save contact | Solid forest green button; show Saving… and disable repeat submission. |
| Cancel | Plain secondary action that closes the panel without saving. |

On save failure, keep the panel open and preserve entered values. On success, update the list, close the panel, and announce the result. Move keyboard focus into the panel when it opens, contain focus while it is modal, and return focus to the triggering control when it closes.

# **Delete confirmation**

Show Delete Jamie Doe? followed by This contact will be permanently removed. Offer Cancel and a clearly labeled Delete contact button with a restrained destructive treatment. If deletion fails, keep the confirmation open and show the error.

# **Interface states and copy**

| State | Suggested presentation |
| :---- | :---- |
| Loading | Loading contacts… |
| Empty directory | Your directory starts here. Include Add a contact. |
| No search results | No matching contacts. Include Clear search when search exists. |
| Request failure | Short error explanation and a Retry action. |
| Success | Contact added, Contact updated, or Contact deleted. |

Review before delivery: verify all CRUD actions, readable mobile layouts, keyboard navigation, visible focus, form errors, and pending states. The finished screen should be easy to understand without decorative explanation.