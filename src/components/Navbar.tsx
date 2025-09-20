"use client";
import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Container,
  Divider,
  useTheme,
  useMediaQuery,
  Fade,
} from "@mui/material";
import { Menu as MenuIcon, Close as CloseIcon } from "@mui/icons-material";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { HashcaseText } from "../assets";
import ConnectButton from "./ConnectButton";
import { useGlobalAppStore } from "@/store/globalAppStore";

export const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();

  // Global store
  const { connectedWallets, getWalletForChain } = useGlobalAppStore();

  // Individual wallet hooks
  const { address: evmAddress } = useAccount(); // EVM wallet
  const { authenticated: privyAuthenticated, user: privyUser } = usePrivy(); // Privy

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [displayAddress, setDisplayAddress] = useState<string | null>(null);

  const open = Boolean(anchorEl);

  console.log("NAVBAR_DEBUG: Wallet states:", {
    evmAddress,
    privyAuthenticated,
    privyWalletAddress: privyUser?.wallet?.address,
    privyEmail: privyUser?.email?.address,
  });

  // Determine which address to use for profile navigation
  const getProfileAddress = (): string | null => {
    // Priority: Regular EVM wallet -> Privy wallet
    if (evmAddress) {
      return evmAddress;
    }
    if (privyAuthenticated && privyUser?.wallet?.address) {
      return privyUser.wallet.address;
    }
    return null;
  };

  // Get display info for the connected wallet
  const getWalletDisplayInfo = (): {
    address: string;
    type: "EVM" | "Google";
  } | null => {
    if (evmAddress) {
      return {
        address: evmAddress.slice(0, 6) + "..." + evmAddress.slice(-4),
        type: "EVM",
      };
    }
    if (privyAuthenticated && privyUser?.wallet?.address) {
      return {
        address:
          privyUser.wallet.address.slice(0, 6) +
          "..." +
          privyUser.wallet.address.slice(-4),
        type: "Google",
      };
    }
    return null;
  };

  // Update display address when wallets change
  useEffect(() => {
    const profileAddress = getProfileAddress();
    const walletInfo = getWalletDisplayInfo();

    if (profileAddress && walletInfo) {
      setDisplayAddress(walletInfo.address);
      console.log("NAVBAR_DEBUG: Updated display address:", {
        address: walletInfo.address,
        type: walletInfo.type,
        fullAddress: profileAddress,
      });
    } else {
      setDisplayAddress(null);
      console.log("NAVBAR_DEBUG: No wallet connected, cleared display address");
    }
  }, [evmAddress, privyAuthenticated, privyUser]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    const profileAddress = getProfileAddress();

    if (profileAddress) {
      console.log("NAVBAR_DEBUG: Navigating to profile:", profileAddress);
      router.push(`/profile/${profileAddress}`);
      handleClose();
    } else {
      toast.error(
        "Please connect wallet or sign in with Google to view your profile"
      );
    }
  };

  const handleNavigation = (path: string) => {
    console.log("NAVBAR_DEBUG: Navigating to:", path);
    router.push(path);
    handleClose();
  };

  const navigationItems = [
    { label: "Home", path: "/" },
    { label: "Collections", path: "/collections" },
    { label: "Profile", onClick: handleProfileClick },
  ];

  return (
    <AppBar
      position="sticky"
      className="!bg-[#111827] backdrop-blur-md border-b border-white/10 shadow-lg"
    >
      <Container maxWidth="lg" className="px-4 sm:px-6 md:px-8 md:py-1">
        <Toolbar className="flex justify-between items-center min-h-14 sm:min-h-16 !px-0">
          <div className="flex items-center gap-10">
            {/* Logo */}
            <Box className="flex items-center">
              <Link href="/" className="flex items-center no-underline">
                <HashcaseText />
              </Link>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box className="flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-full px-5 py-2 border border-white/10 shadow-lg">
                {navigationItems.map((item) => (
                  <Button
                    key={item.label}
                    onClick={
                      item.onClick || (() => handleNavigation(item.path!))
                    }
                    className="!text-white !font-medium !px-4 !py-1 !rounded-full !normal-case !transition-all !duration-300 hover:!bg-white/10 hover:backdrop-blur-md focus-visible:!outline-2 focus-visible:!outline-white/30"
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}
          </div>

          {/* Right side controls */}
          <Box className="flex items-center gap-3">
            {/* Desktop Connect Button */}
            {!isMobile && <ConnectButton />}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                aria-controls="mobile-menu"
                aria-haspopup="true"
                onClick={handleMenu}
                className="!text-white hover:!bg-white/10"
              >
                {open ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Menu */}
      <Menu
        id="mobile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          className:
            "!bg-slate-900/98 !backdrop-blur-xl !border-0 !rounded-none !shadow-2xl !shadow-black/50 !mt-0 !w-screen !max-w-none",
          style: {
            left: "0 !important",
            right: "0 !important",
            width: "100vw",
            maxWidth: "none",
            backgroundColor: "#00041F",
          },
        }}
        MenuListProps={{
          className: "!p-0",
        }}
      >
        <div className="px-4 sm:px-6 py-4 space-y-1">
          {navigationItems.map((item, index) => (
            <MenuItem
              key={item.label}
              onClick={item.onClick || (() => handleNavigation(item.path!))}
              className="!text-white !font-medium !py-3 !px-4 !rounded-lg !mx-0 !my-1 !transition-all !duration-200 hover:!bg-white/15 focus-visible:!outline-2 focus-visible:!outline-white/30"
            >
              {item.label}
            </MenuItem>
          ))}

          <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4" />

          <div className="px-4 py-2">
            <ConnectButton />
          </div>
        </div>
      </Menu>
    </AppBar>
  );
};
