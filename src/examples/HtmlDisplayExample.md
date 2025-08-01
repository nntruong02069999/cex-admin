# HTML Display Type Example

This example shows how to use the new HTML display type in a grid configuration.

## Setup in Page Editor

1. Go to the page editor
2. Add a column to your grid with the following configuration:
   - **Name**: HTML Content
   - **Field**: htmlContent
   - **Type**: string
   - **Display**: html

## API Response Example

Your API should return HTML content in the specified field:

```json
{
  "data": [
    {
      "id": 1,
      "title": "Example Item",
      "htmlContent": "<div style='color: blue;'><h3>This is a heading</h3><p>This is a paragraph with <b>bold text</b> and <i>italic text</i>.</p><ul><li>List item 1</li><li>List item 2</li></ul></div>"
    }
  ],
  "count": 1
}
```

## Features

- Responsive display that works on both mobile and desktop
- Click to expand for viewing large HTML content in a modal
- Properly contained to avoid affecting other UI elements

## Security Considerations

When using the HTML display type, remember:

1. The HTML content is rendered using React's `dangerouslySetInnerHTML`
2. Ensure that the HTML content is properly sanitized on the server side to prevent XSS attacks
3. For complete security, consider adding a HTML sanitizer library like DOMPurify:

```typescript
import DOMPurify from 'dompurify';

// In the HtmlContent component:
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
```

## Custom Configuration

You can customize the HTML display by modifying the HtmlContent component:

```typescript
// Example with custom height
<HtmlContent content={value} maxHeight={300} showExpand={false} />
``` 