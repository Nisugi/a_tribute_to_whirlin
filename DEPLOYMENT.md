# Deployment Guide

## Enabling GitHub Pages

To enable GitHub Pages for your repository, follow these steps:

### Option 1: Using GitHub Actions (Recommended)

1. Go to your repository on GitHub: https://github.com/Nisugi/a_tribute_to_whirlin
2. Click on **Settings** (top navigation)
3. Click on **Pages** in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. The deployment workflow is already configured (`.github/workflows/deploy.yml`)
6. Your site will automatically deploy when you push to the master branch
7. Once deployed, your site will be available at: **https://nisugi.github.io/a_tribute_to_whirlin/**

### Option 2: Using Branch Deploy (Alternative)

If you prefer not to use GitHub Actions:

1. Go to **Settings** → **Pages**
2. Under **Source**, select **Deploy from a branch**
3. Choose **master** branch
4. Choose **/ (root)** folder
5. Click **Save**
6. Wait a few minutes for the deployment to complete

## Verifying Deployment

After enabling GitHub Pages:

1. The **Actions** tab will show the deployment progress
2. Once the workflow completes (green checkmark), your site is live
3. Visit https://nisugi.github.io/a_tribute_to_whirlin/ to see your application

## Initial Setup Warning

GitHub Pages may take 5-10 minutes to become available the first time you enable it.

## Troubleshooting

### Large File Warning
You may see a warning about `data/all_sheets.json` being large (56 MB). This is acceptable and won't prevent deployment, but if you encounter issues:

- Consider splitting the file into smaller chunks
- Use Git LFS (Large File Storage) for files over 50 MB
- Optimize JSON by removing unnecessary whitespace

### Site Not Loading
If the site doesn't load:

1. Check the Actions tab for deployment errors
2. Ensure GitHub Pages is enabled in Settings
3. Verify the site URL matches your GitHub username and repo name
4. Clear your browser cache and try again

### CORS or Module Loading Errors
If you see JavaScript module errors:

- The site must be served over HTTP/HTTPS (not opened as a local file)
- GitHub Pages automatically handles this correctly
- For local testing, use a local web server:
  ```bash
  python -m http.server 8000
  ```
  Then visit: http://localhost:8000

## Custom Domain (Optional)

To use a custom domain:

1. Go to **Settings** → **Pages**
2. Under **Custom domain**, enter your domain name
3. Configure your DNS provider to point to GitHub Pages
4. Enable **Enforce HTTPS** for security

See: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

## Updating the Site

To update the live site:

1. Make changes to your local files
2. Commit your changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```
3. Push to GitHub:
   ```bash
   git push
   ```
4. GitHub Actions will automatically redeploy (takes 1-2 minutes)

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
