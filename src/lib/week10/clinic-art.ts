import entranceAsset from "@/assets/week10/clinic-entrance.png.asset.json";
import receptionAsset from "@/assets/week10/clinic-reception.png.asset.json";
import recordsAsset from "@/assets/week10/clinic-records-office.png.asset.json";
import staffWorkspaceAsset from "@/assets/week10/clinic-staff-workspace.png.asset.json";
import websiteAsset from "@/assets/week10/clinic-website-station.png.asset.json";
import backupAsset from "@/assets/week10/clinic-backup-room.png.asset.json";
import type { RoomId } from "./case-packet";

export interface ClinicIllustration {
  src: string;
  alt: string;
}

export const clinicEntranceIllustration: ClinicIllustration = {
  src: entranceAsset.url,
  alt: "Cloud Heights Family Clinic entrance at dusk, with the reception area visible through the windows.",
};

export const clinicRoomIllustrations: Record<RoomId, ClinicIllustration> = {
  reception: {
    src: receptionAsset.url,
    alt: "Cloud Heights Family Clinic reception desk and waiting area.",
  },
  records: {
    src: recordsAsset.url,
    alt: "Clinic records office with a workstation, filing cabinets, and an open desk drawer.",
  },
  workstations: {
    src: staffWorkspaceAsset.url,
    alt: "Shared clinic staff workspace with two open laptops on wooden desks.",
  },
  website: {
    src: websiteAsset.url,
    alt: "Clinic website station with the public website and certificate information shown on separate monitors.",
  },
  backup: {
    src: backupAsset.url,
    alt: "Clinic backup room workstation with an external backup drive continuously connected to the computer.",
  },
};
