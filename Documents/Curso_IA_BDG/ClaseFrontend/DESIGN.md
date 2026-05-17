---
name: Internal Task System
colors:
  surface: '#f9f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f9f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f5'
  surface-container: '#eeeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e4'
  on-surface: '#1a1c1d'
  on-surface-variant: '#414755'
  inverse-surface: '#2f3132'
  inverse-on-surface: '#f0f0f2'
  outline: '#717786'
  outline-variant: '#c1c6d7'
  surface-tint: '#005bc1'
  primary: '#0058bc'
  on-primary: '#ffffff'
  primary-container: '#0070eb'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#5e5e63'
  on-secondary: '#ffffff'
  secondary-container: '#e0dfe4'
  on-secondary-container: '#626267'
  tertiary: '#9e3d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c64f00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#e3e2e7'
  secondary-fixed-dim: '#c7c6cb'
  on-secondary-fixed: '#1a1b1f'
  on-secondary-fixed-variant: '#46464b'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb595'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7c2e00'
  background: '#f9f9fb'
  on-background: '#1a1c1d'
  surface-variant: '#e2e2e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 41px
    letterSpacing: -0.022em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.019em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 25px
    letterSpacing: -0.017em
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.015em
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.012em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.006em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.021em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 40px
  gutter: 20px
---

## Brand & Style

This design system is anchored in the principles of clarity, efficiency, and premium utility. Designed for internal productivity, it prioritizes content over chrome, utilizing a **Corporate/Modern** aesthetic heavily influenced by Human Interface Guidelines. 

The brand personality is disciplined and unobtrusive. It seeks to evoke a sense of focus and calm through generous whitespace and a "quiet" interface that recedes when the user is deeply engaged in tasks. The visual language uses subtle depth and precision-engineered alignment to communicate reliability and professional rigor.

## Colors

The palette is intentionally restrained to maximize the impact of the primary accent. 
- **Primary Blue (#007AFF):** Used exclusively for interactive elements, primary actions, and progress indicators.
- **Grays:** A tiered system of neutrals manages information hierarchy. `#FBFBFB` is used for secondary content areas like sidebars, while `#F5F5F7` provides structure for backgrounds.
- **Contrast:** Typography remains at high contrast levels against pure white backgrounds to ensure maximum readability and accessibility for long-term daily use.

## Typography

This design system utilizes **Inter** for its exceptional legibility and systematic weight distribution. 
- **Scaling:** Headings use tighter letter spacing and heavier weights to provide clear structural anchors.
- **Hierarchy:** Body text is optimized for reading task descriptions and comments, utilizing a generous 1.5x line-height ratio. 
- **Labels:** Small-scale text (labels and captions) uses medium weights to maintain crispness on standard-resolution displays.

## Layout & Spacing

The layout follows a **Fluid Grid** model with strict 8px incremental spacing. 
- **Desktop:** 12-column grid with 20px gutters. Content is typically contained within a 1440px max-width wrapper, though data-heavy tables may expand to fill the viewport.
- **Tablet:** 8-column grid with 16px margins.
- **Mobile:** 4-column grid with 16px margins.
- **Philosophy:** Use padding to create logical groupings rather than heavy dividers. Horizontal white space should be used to separate work streams, while vertical rhythm is maintained through consistent 16px or 24px gaps between components.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and **Tonal Layers**. 
- **Base Layer:** Pure white (#FFFFFF) for the main workspace.
- **Lowered Layer:** Soft grays (#FBFBFB) for navigation and utility panels to suggest they sit "behind" the active task area.
- **Elevated Layer:** Active cards and modals use a very soft, diffused shadow: `0px 4px 12px rgba(0, 0, 0, 0.05)`. 
- **Borders:** A subtle 1px border (#D2D2D7) is used only when necessary to define boundaries on low-contrast screens, ensuring the UI remains sharp and structured.

## Shapes

The shape language is defined by **Rounded** corners, mirroring modern hardware and OS-level aesthetics. 
- **Small Elements:** Buttons and input fields utilize an 8px radius.
- **Large Elements:** Task cards, modals, and container surfaces utilize a 12px to 16px radius.
- **Consistency:** Roundedness should be consistent across all sides of an element unless it is pinned to the edge of the screen (e.g., sidebars).

## Components

- **Buttons:** Primary buttons are solid blue (#007AFF) with white text. Secondary buttons are light gray (#F5F5F7) with blue or black text. All have 8px corners and a 44px minimum tap target height.
- **Cards:** White background with a 1px border or a very soft shadow. No heavy headers; use typography and spacing to denote the title.
- **Input Fields:** 1px border (#D2D2D7) that transitions to blue on focus. Subtle gray background (#FBFBFB) helps the field stand out against white surfaces.
- **Chips/Status Tags:** Use light, desaturated background tints of the status color (e.g., light blue for "In Progress") with high-contrast text for visibility.
- **Lists:** Clean rows with 1px bottom dividers. Use a subtle hover state (#F5F5F7) to provide immediate interactive feedback.
- **Task Specifics:** Progress bars should be thin (4px-6px) and use the primary blue, emphasizing precision over bulk.