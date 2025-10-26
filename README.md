# SSHS-OCW

## Scripts

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Environment Setting

### .env

Create two files: .env.production and .env.development.

both of the .env structure should have API_URL as below.

```ini
REACT_APP_API_URL="Your Backend Base URL"
```

## App Structure

### Auth

sshs-ocw use stateless auth, i.e. authentication based on jwt and without sessions. 

Also, hybridized approach is used for auth:

+ `accessToken`, which expires every 15min and lives only in memory. 
+ `refreshToken`, which does not expire for a log time and is stored in http-only cookie.

Therefore, custom-defined axios instance `http` should be used for most API calls, which intercepts every request and attaches `accessToken` as Authentication Bearer Token.

When responded with a 401, which is only raised when `accessToken` is expired or there is no valid `accessToken`, it intercepts the response and tries hitting `/api/auth/verify`, which mints a new `accessToken` if the `refreshToken` is valid. 

If the response contains a new `accessToken`, http tries the same request again. If it fails, it logs the user out. 

### Editor Structure

SSHS-OCW uses Tiptap to provide lesson editing and viewing features.

The base Tiptap editor is defined at `/src/editor/LessonBody.tsx`.

There are three Routes related to lesson:

1. `lessons/:lessonId`, a route for viewing the lesson
2. `lessons/:lessonId/edit`, a route for editing(modifying) an lesson that already exists
3. `lessons/create`, a route for creating new lesson

`lessons/:lessonId` passes `editable: false`, thus configuring a view-only editor. Appshell and the elements rendered before and after the editor are passed as props named `Shell`, `before`, `after`.

`lessons/:lessonId/edit` and `lessons/create` passes `editable: true`, thus making editor editable. 