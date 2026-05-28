# Inline Rich Text Editor

## Description

The `inlineRichTextEditor` is a Lightning Web Component designed for use in Salesforce Screen Flows. It provides a clean, inline editing experience for rich text fields, mimicking the look and feel of a standard Salesforce record detail page.

When a user sees the component, it displays the rich text content. Clicking on the text or an adjacent pencil icon switches the component to an edit mode, revealing a rich text input field. The component saves automatically when the user clicks away (on blur), providing a seamless experience.

## Features

-   **Inline Editing**: View and edit rich text directly within a flow screen.
-   **Seamless Save**: Changes are saved automatically when the user clicks out of the editor.
-   **Clean UI**: The formatting toolbar is hidden to maintain a simple, clean interface. Keyboard shortcuts for formatting (bold, italics, etc.) are still supported.
-   **Flow Ready**: Designed to be used as a screen component in flows, with a `value` property to pass the text content in and out.
-   **Default Value**: Supports a default value, with pre-loaded sample text if no value is provided.

## Setup

1.  Add the `inlineRichTextEditor` to your flow screen.
2.  In the component properties, you can set the `value` attribute:
    -   **Input**: Pass a flow variable containing rich text into the `value` property to set the initial text.
    -   **Output**: The component's output `value` will contain the edited rich text. You can map this to a flow variable to use the updated text later in your flow.

## Known Limitations

-   **Toolbar Visibility**: The rich text editor's formatting toolbar is intentionally hidden to provide a cleaner UI. All formatting must be done via standard keyboard shortcuts (e.g., Cmd/Ctrl+B for bold).
-   **Top Border**: Due to the Salesforce Lightning Web Components' Shadow DOM encapsulation, a thin border may appear at the top of the rich text editor when in edit mode. Standard CSS cannot remove this, and it is a known limitation of the underlying `lightning-input-rich-text` component. 