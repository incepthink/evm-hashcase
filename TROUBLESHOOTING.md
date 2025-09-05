# Troubleshooting Guide

## Wallet Connection Issues

### Common Error Messages and Solutions

#### 1. "Unexpected error" or "Oe" Error
**Problem**: Wallet extension internal error
**Solutions**:
- Refresh the page and try again
- Restart the wallet extension (disable and re-enable in browser)
- Update the wallet extension to the latest version
- Clear browser cache and cookies
- Try a different browser

#### 2. "TRPCClientError: Failed to fetch"
**Problem**: Network connectivity issue or backend API not available
**Solutions**:
- Check your internet connection
- Ensure the backend API is running
- Try refreshing the page
- Check if the API endpoint is correct in your environment variables

#### 3. "Request timeout"
**Problem**: API requests are taking too long to respond
**Solutions**:
- Check your internet connection speed
- Try again in a few moments
- Check if the backend server is overloaded
- Contact support if the issue persists

#### 4. "Wallet is not installed"
**Problem**: Sui wallet extension is not installed
**Solutions**:
- Install the Sui wallet extension from the browser store
- Make sure the extension is enabled
- Refresh the page after installation

#### 5. "User rejected the signature request"
**Problem**: User didn't approve the signature request in the wallet
**Solutions**:
- Approve the signature request when prompted in your wallet
- Make sure you're using the correct wallet account
- Check if the wallet is unlocked

#### 6. "Authentication failed"
**Problem**: Backend authentication failed
**Solutions**:
- Try connecting again
- Refresh the page
- Check if your wallet address is properly registered
- Contact support if the issue persists

#### 7. "No wallet address available"
**Problem**: Wallet connection didn't complete properly
**Solutions**:
- Try connecting again
- Make sure the wallet extension is properly loaded
- Check if the wallet has any accounts
- Refresh the page and try again

## General Troubleshooting Steps

1. **Clear Browser Data**: Clear cache, cookies, and local storage
2. **Update Extensions**: Ensure all browser extensions are up to date
3. **Check Network**: Verify stable internet connection
4. **Try Different Browser**: Test with Chrome, Firefox, or Edge
5. **Restart Browser**: Close and reopen your browser
6. **Check Console**: Open browser developer tools and check for additional error messages

## Environment Variables

Make sure these environment variables are properly set:
- `NEXT_PUBLIC_API`: Your backend API URL

## Support

If you continue to experience issues, please:
1. Check the browser console for detailed error messages
2. Note the exact error message and steps to reproduce
3. Contact the development team with this information 