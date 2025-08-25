# Blog Feature Documentation

## Overview
The Blog feature in Pawthway allows users to share their thoughts, knowledge, and experiences in a community-driven platform similar to Reddit. Users can create posts, comment on others' posts, like content, and filter posts by categories.

## Features

### For All Users
- View all blog posts
- Sort posts by newest, popular, or trending
- Filter posts by categories
- View individual post details and comments
- Search for specific posts (planned for future implementation)

### For Authenticated Users
- Create new blog posts
- Edit or delete their own posts
- Like posts
- Comment on posts
- Delete their own comments

## Implementation Details

### Components

1. **Blog.jsx**
   - Main blog page component
   - Displays a grid of blog post cards
   - Includes filtering and sorting controls
   - Contains a form for creating new posts (for authenticated users)

2. **BlogPost.jsx**
   - Individual blog post detail page
   - Displays full post content
   - Shows comments section
   - Provides edit/delete options for post authors
   - Allows users to like posts and add comments

### Data Structure

#### Blog Posts Collection
```
blogPosts/
  postId/
    title: string
    content: string
    category: string
    imageUrl: string (optional)
    authorId: string (reference to users collection)
    authorName: string
    createdAt: timestamp
    updatedAt: timestamp
    likes: number
    views: number
    commentCount: number
```

#### Comments Collection
```
comments/
  commentId/
    postId: string (reference to blogPosts collection)
    content: string
    authorId: string (reference to users collection)
    authorName: string
    createdAt: timestamp
    likes: number
```

### User Interactions

#### Creating a Post
1. User fills out the post creation form
2. Form data is validated
3. New document is created in the blogPosts collection
4. User is redirected to the new post's detail page

#### Commenting on a Post
1. User enters comment text in the comment form
2. New document is created in the comments collection
3. Comment count is incremented on the parent post

#### Liking a Post
1. User clicks the like button
2. Like count is incremented on the post
3. User's ID is added to a likes subcollection to prevent multiple likes

## Styling
The blog components use a dedicated CSS file (`Blog.css`) that maintains consistency with the application's overall design while providing specific styling for blog elements.

## Future Enhancements

1. **Rich Text Editor**: Implement a WYSIWYG editor for post creation and editing
2. **Image Uploads**: Allow users to upload multiple images to their posts
3. **Advanced Filtering**: Add more filtering options such as date ranges and popularity thresholds
4. **User Notifications**: Notify users when their posts receive comments or likes
5. **Bookmarking**: Allow users to bookmark posts for later reading
6. **Reporting System**: Implement a system for reporting inappropriate content
7. **Tags**: Add support for tagging posts and filtering by tags

## Integration Points

- **Authentication**: Uses Firebase Auth for user authentication
- **Data Storage**: Uses Firebase Firestore for storing posts and comments
- **Navigation**: Integrated with React Router for navigation between blog pages
- **UI Components**: Uses the application's existing UI components and styling conventions
- **Dark Mode**: Supports the application's dark mode functionality