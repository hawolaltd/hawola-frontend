# Navigation Component

## Overview

A reusable navigation component with dropdown menus for the main header.

## Location

`/frontend/src/components/header/Navigation.tsx`

## Usage

```tsx
import Navigation from './Navigation';

// In your component
<Navigation dropdownOpen={dropdownOpen} toggleDropdown={toggleDropdown} />;
```

## Props

| Prop             | Type                     | Description                       |
| ---------------- | ------------------------ | --------------------------------- |
| `dropdownOpen`   | `string \| null`         | Currently open dropdown menu name |
| `toggleDropdown` | `(menu: string) => void` | Function to toggle dropdown state |

## Navigation Items

### With Dropdowns:

1. **Home** ↓

    - Home
    - About Us
    - Contact Us

2. **Shop** ↓

    - All Products
    - Flash Deals
    - Top Sellers

3. **Vendors** ↓

    - Vendors Listing
    - Vendor Single

4. **Pages** ↓
    - About Us
    - Contact Us
    - Careers

### Direct Links:

5. **Blog**
6. **Contact**

## Features

-   ✅ **Hover to Open** - Dropdowns appear on mouse enter
-   ✅ **Click to Toggle** - Can also click button to open/close
-   ✅ **Auto Close** - Closes when mouse leaves
-   ✅ **Responsive** - Only visible on XL screens (`hidden xl:flex`)
-   ✅ **Styled Arrows** - SVG arrows indicate dropdowns
-   ✅ **Hover Effects** - Orange color on hover

## Editing Navigation

To modify navigation items, edit `/frontend/src/components/header/Navigation.tsx`:

### Add a New Menu Item (with dropdown):

```tsx
<li
    onMouseEnter={() => toggleDropdown('newmenu')}
    onMouseLeave={() => toggleDropdown('')}
    className="relative text-primary text-[14px] hover:text-deepOrange"
>
    <button
        onClick={() => toggleDropdown('newmenu')}
        className="flex items-center gap-1"
    >
        New Menu
        {/* SVG arrow icon */}
    </button>
    {dropdownOpen === 'newmenu' && (
        <ul className="absolute left-0 z-10 mt-2 w-48 bg-white shadow-lg border rounded-md">
            <li>
                <Link
                    href="/link1"
                    className="block text-primary px-4 py-2 hover:text-deepOrange"
                >
                    Item 1
                </Link>
            </li>
            <li>
                <Link
                    href="/link2"
                    className="block text-primary px-4 py-2 hover:text-deepOrange"
                >
                    Item 2
                </Link>
            </li>
        </ul>
    )}
</li>
```

### Add a Simple Link (no dropdown):

```tsx
<Link href={'/your-page'}>
    <li className="text-primary text-[14px] hover:text-deepOrange">
        Your Link
    </li>
</Link>
```

## Styling

### Main Button:

-   Text: `text-primary` (dark blue)
-   Hover: `hover:text-deepOrange`
-   Size: `text-[14px]`

### Dropdown Menu:

-   Background: White
-   Border: Gray rounded
-   Shadow: `shadow-lg`
-   Position: `absolute left-0 z-10 mt-2`

### Dropdown Items:

-   Hover: Orange text
-   Padding: `px-4 py-2`

## Integration

This component is used in:

-   `MainHeader.tsx` - Main site header
-   Can be reused in other headers as needed

## Example State Management

In the parent component:

```tsx
const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

const toggleDropdown = (menu: string) => {
    setDropdownOpen(dropdownOpen === menu ? null : menu);
};
```

## Notes

-   Only visible on XL screens (1280px+)
-   On smaller screens, use mobile drawer menu
-   Arrow icons from SVG for consistency
-   All external links use `#` placeholder - update with real URLs

---

**Easy to edit and maintain!** 🎉
