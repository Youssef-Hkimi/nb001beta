"use client";

import {
  Button,
  Card,
  Form,
  Input,
  Label,
  TextArea,
  TextField,
  toast,
} from "@heroui/react";
import { AtSign, Code2, Gamepad2, Save, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";

import { useAuth } from "@/lib/auth/auth-context";

type ProfileForm = {
  displayName: string;
  bio: string;
  x: string;
  github: string;
  roblox: string;
};

export function UserSettings() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<ProfileForm>(() => ({
    displayName: user?.displayName ?? user?.username ?? "",
    bio: user?.bio ?? "",
    x: user?.socials?.x ?? "",
    github: user?.socials?.github ?? "",
    roblox: user?.socials?.roblox ?? "",
  }));

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const displayName = profile.displayName.trim();
    if (!displayName) {
      toast.warning("Display name is required");
      return;
    }

    updateUser({
      displayName,
      bio: profile.bio.trim(),
      socials: {
        x: profile.x.trim(),
        github: profile.github.trim(),
        roblox: profile.roblox.trim(),
      },
    });
    toast.success("Profile updated", {
      description: "Your Nexus profile changes were saved successfully.",
    });
  }

  return (
    <Form onSubmit={saveProfile} className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
      <Card className="nexus-card gap-5">
        <Card.Header>
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <UserRound className="size-5" />
          </span>
          <div>
            <Card.Title>Public profile</Card.Title>
            <Card.Description>Update the name and bio people see across Nexus.</Card.Description>
          </div>
        </Card.Header>
        <Card.Content className="space-y-5">
          <TextField
            isRequired
            value={profile.displayName}
            onChange={(value) => update("displayName", value)}
          >
            <Label>Display name</Label>
            <Input placeholder="Your Nexus display name" maxLength={40} />
          </TextField>

          <TextField value={profile.bio} onChange={(value) => update("bio", value)}>
            <div className="flex items-center justify-between gap-3">
              <Label>Bio</Label>
              <span className="text-xs text-muted">{profile.bio.length}/240</span>
            </div>
            <TextArea
              rows={6}
              maxLength={240}
              placeholder="Tell people about yourself and what you build."
              className="resize-y"
            />
          </TextField>
        </Card.Content>
      </Card>

      <Card className="nexus-card gap-5">
        <Card.Header>
          <div>
            <Card.Title>Social links</Card.Title>
            <Card.Description>Connect the profiles you want visitors to find.</Card.Description>
          </div>
        </Card.Header>
        <Card.Content className="space-y-4">
          <SocialField
            label="X"
            value={profile.x}
            placeholder="username"
            icon={<AtSign className="size-4" />}
            onChange={(value) => update("x", value)}
          />
          <SocialField
            label="GitHub"
            value={profile.github}
            placeholder="username"
            icon={<Code2 className="size-4" />}
            onChange={(value) => update("github", value)}
          />
          <SocialField
            label="Roblox"
            value={profile.roblox}
            placeholder="username"
            icon={<Gamepad2 className="size-4" />}
            onChange={(value) => update("roblox", value)}
          />
        </Card.Content>
        <Card.Footer className="justify-end border-t border-border pt-4">
          <Button type="submit">
            <Save className="size-4" />
            Save changes
          </Button>
        </Card.Footer>
      </Card>
    </Form>
  );
}

function SocialField({
  label,
  value,
  placeholder,
  icon,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  icon: React.ReactNode;
  onChange: (value: string) => void;
}) {
  return (
    <TextField value={value} onChange={onChange}>
      <Label className="flex items-center gap-2">{icon}{label}</Label>
      <Input placeholder={placeholder} autoCapitalize="none" />
    </TextField>
  );
}
