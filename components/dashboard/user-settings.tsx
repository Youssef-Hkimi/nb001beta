"use client";

import {
  Avatar,
  Button,
  Card,
  Chip,
  Form,
  Input,
  Label,
  Separator,
  Switch,
  TextArea,
  TextField,
  toast,
} from "@heroui/react";
import {Bell, Save, Share2, UserRound} from "lucide-react";
import {useState, type ReactNode} from "react";

import {IconifyIcon} from "@/components/ui/iconify-icon";
import {useAuth} from "@/lib/auth/auth-context";

type NotificationKey = "listingUpdates" | "likeMilestones" | "announcements";

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

type ProfileForm = {
  bio: string;
  x: string;
  github: string;
  roblox: string;
  inboxNotifications: boolean;
  notifications: Record<NotificationKey, boolean>;
};

function SettingsSwitch({title, description, isSelected, isDisabled, onChange}: {
  title: string;
  description: string;
  isSelected: boolean;
  isDisabled?: boolean;
  onChange: (selected: boolean) => void;
}) {
  return (
    <Switch
      className="w-full rounded-2xl border border-border/70 bg-surface-2/45 p-4 transition-colors hover:bg-surface-2/70"
      isDisabled={isDisabled}
      isSelected={isSelected}
      onChange={onChange}
    >
      <Switch.Content>
        <div className="min-w-0 flex-1 pr-4">
          <p className="font-medium text-foreground">{title}</p>
          <p className="mt-0.5 text-sm leading-5 text-muted">{description}</p>
        </div>
        <Switch.Control><Switch.Thumb /></Switch.Control>
      </Switch.Content>
    </Switch>
  );
}

function SectionHeader({icon, title, description}: {icon: ReactNode; title: string; description: string}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">{icon}</div>
      <div>
        <Card.Title>{title}</Card.Title>
        <Card.Description className="mt-1">{description}</Card.Description>
      </div>
    </div>
  );
}

export function UserSettings() {
  const {user, updateUser} = useAuth();
  const [profile, setProfile] = useState<ProfileForm>({
    bio: user?.bio ?? "",
    x: user?.socials?.x ?? "",
    github: user?.socials?.github ?? "",
    roblox: user?.socials?.roblox ?? "",
    inboxNotifications: user?.inboxNotifications ?? true,
    notifications: {
      listingUpdates: user?.notificationPreferences?.listingUpdates ?? true,
      likeMilestones: user?.notificationPreferences?.likeMilestones ?? true,
      announcements: user?.notificationPreferences?.announcements ?? true,
    },
  });

  const updateField = <K extends keyof Omit<ProfileForm, "notifications">>(key: K, value: ProfileForm[K]) => {
    setProfile((current) => ({...current, [key]: value}));
  };

  const updateNotification = (key: NotificationKey, value: boolean) => {
    setProfile((current) => ({...current, notifications: {...current.notifications, [key]: value}}));
  };

  const saveProfile = async () => {
    try {
      await updateUser({
        bio: profile.bio.trim(),
        inboxNotifications: profile.inboxNotifications,
        notificationPreferences: profile.notifications,
        socials: {x: profile.x.trim(), github: profile.github.trim(), roblox: profile.roblox.trim()},
      });
      toast.success("Settings updated", {description: "Your profile preferences have been saved."});
    } catch {
      toast.danger("Could not save settings", {description: "Please try again."});
    }
  };

  return (
    <Form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        void saveProfile();
      }}
    >
      <Card className="nexus-card overflow-hidden">
        <Card.Content className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <Avatar className="size-16 rounded-2xl ring-1 ring-border">
            {user?.avatarUrl ? <Avatar.Image alt={user.username} src={user.avatarUrl} /> : null}
            <Avatar.Fallback>{getInitials(user?.displayName || user?.username || "Nexbiy")}</Avatar.Fallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-semibold">{user?.displayName || user?.username || "Nexbiy user"}</h2>
              <Chip color="success" size="sm" variant="soft">
                <IconifyIcon className="size-3.5" icon="ic:baseline-discord" />
                Discord connected
              </Chip>
            </div>
            <p className="mt-1 text-sm text-muted">@{user?.username ?? "nexbiy-user"}</p>
          </div>
          <p className="max-w-sm text-sm leading-5 text-muted sm:text-right">
            Your avatar and Discord identity are synced from your connected account.
          </p>
          <Button className="shrink-0" type="submit" variant="primary">
            <Save className="size-4" />
            Save settings
          </Button>
        </Card.Content>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="nexus-card">
          <Card.Header className="p-5 pb-0">
            <SectionHeader description="Control the information visitors see across Nexbiy." icon={<UserRound className="size-5" />} title="Public profile" />
          </Card.Header>
          <Card.Content className="grid gap-4 p-5">
            <TextField isReadOnly name="username">
              <Label>Discord username</Label>
              <Input value={user?.username ?? ""} />
              <p className="text-xs text-muted">Synced from Discord and cannot be changed on Nexbiy.</p>
            </TextField>
            <TextField name="bio">
              <div className="flex items-center justify-between gap-3"><Label>Short bio</Label><span className="text-xs text-muted">{profile.bio.length}/120</span></div>
              <TextArea className="min-h-24" maxLength={120} placeholder="A short introduction about you." value={profile.bio} onChange={(event) => updateField("bio", event.target.value)} />
            </TextField>
          </Card.Content>
        </Card>

        <Card className="nexus-card">
          <Card.Header className="p-5 pb-0">
            <SectionHeader description="Connect the profiles you want visitors to find." icon={<Share2 className="size-5" />} title="Social links" />
          </Card.Header>
          <Card.Content className="grid gap-4 p-5">
            <TextField name="x">
              <Label className="flex items-center gap-2"><IconifyIcon className="size-4" icon="simple-icons:x" />X</Label>
              <Input placeholder="Username" value={profile.x} onChange={(event) => updateField("x", event.target.value)} />
            </TextField>
            <TextField name="github">
              <Label className="flex items-center gap-2"><IconifyIcon className="size-4" icon="simple-icons:github" />GitHub</Label>
              <Input placeholder="Username" value={profile.github} onChange={(event) => updateField("github", event.target.value)} />
            </TextField>
            <TextField name="roblox">
              <Label className="flex items-center gap-2"><IconifyIcon className="size-4" icon="simple-icons:roblox" />Roblox</Label>
              <Input placeholder="Username" value={profile.roblox} onChange={(event) => updateField("roblox", event.target.value)} />
            </TextField>
            <p className="text-xs leading-5 text-muted">Enter usernames only. Nexbiy will build the public profile links for you.</p>
          </Card.Content>
        </Card>
      </div>

      <div>
        <Card className="nexus-card">
          <Card.Header className="p-5 pb-0">
            <SectionHeader description="Choose which listing activity appears in your header inbox." icon={<Bell className="size-5" />} title="Inbox notifications" />
          </Card.Header>
          <Card.Content className="grid gap-3 p-5">
            <SettingsSwitch description="Keep important Nexbiy activity available from the site header." isSelected={profile.inboxNotifications} title="Enable inbox notifications" onChange={(selected) => updateField("inboxNotifications", selected)} />
            <Separator className="my-1" />
            <SettingsSwitch description="Review decisions, suspensions, and listing status changes." isDisabled={!profile.inboxNotifications} isSelected={profile.notifications.listingUpdates} title="Listing updates" onChange={(selected) => updateNotification("listingUpdates", selected)} />
            <SettingsSwitch description="Celebrate when a listing reaches a new vote milestone." isDisabled={!profile.inboxNotifications} isSelected={profile.notifications.likeMilestones} title="Vote milestones" onChange={(selected) => updateNotification("likeMilestones", selected)} />
            <SettingsSwitch description="Product updates, verification news, and platform notices." isDisabled={!profile.inboxNotifications} isSelected={profile.notifications.announcements} title="Nexbiy announcements" onChange={(selected) => updateNotification("announcements", selected)} />
          </Card.Content>
        </Card>

      </div>
    </Form>
  );
}
