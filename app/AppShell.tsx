import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Bell, Car, ChartNoAxesCombined, Contact, FileChartColumn, Globe2, LayoutDashboard,
  LogOut, Menu, ReceiptText, Settings, Users, WalletCards, Wrench,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/supabase/client";