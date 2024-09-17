import { HouseSimple } from "@phosphor-icons/react";
import { Button } from "@reactive-resume/ui";
import React from "react";
import { Link } from "react-router-dom";
import { UserOptions } from "@/client/components/user-options";
import { UserAvatar } from "@/client/components/user-avatar";
import { ThemeSwitch } from "@/client/components/theme-switch";

type HeaderProps = {
  title: string;
};

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="flex h-12 items-center justify-between bg-white px-4 shadow-sm">
      <UserOptions>
        <Button size="icon" variant="ghost" className="rounded-full">
          <UserAvatar size={28} />
        </Button>
      </UserOptions>
      
      <div className="flex items-center gap-x-1">
        <Button asChild size="icon" variant="ghost">
          <Link to="/dashboard/smart-tables">
            <HouseSimple />
          </Link>
        </Button>
        <span className="mr-2 text-xs opacity-40">{"/"}</span>
        <h1 className="font-medium">{title}</h1>
      </div>
      
      <ThemeSwitch />
    </header>
  );
};
