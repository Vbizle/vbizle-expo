import React from "react";
import ProfileHeader from "../ProfileHeader";

/**
 * PublicProfileHeader
 * -------------------
 * - ProfileHeader'ı AYNEN kullanır
 * - Edit / mutation işlemleri YOK
 * - Kapak / galeri SADECE görüntülenir
 * - Ziyaretçi modu
 */

type Props = {
  profile: {
    avatar?: string;
    username: string;
    vbId?: string;
    gender?: string;
    age?: string | number;
    nationality?: any;
    gallery: string[];
    vipScore: number;
    levelInfo: {
      level: number;
      label: string;
      color: string;
    };
  };
};

// 🔒 BOŞ FONKSİYON (noop)
const noop = () => {};

export default function PublicProfileHeader({ profile }: Props) {
  return (
    <ProfileHeader
      avatar={profile.avatar}
      username={profile.username}
      vbId={profile.vbId || ""}
      gender={profile.gender}
      age={profile.age}
      nationality={profile.nationality}
      gallery={profile.gallery}
      vipScore={profile.vipScore}
      levelInfo={profile.levelInfo}

      // 🔒 ZİYARETÇİ MODU
      isPublic={true}

      // 🔒 MUTATION YOK → NOOP
      usernameEdit={false}
      savingUsername={false}

      onAvatarChange={noop}
      onUsernameClick={noop}
      onUsernameChange={noop}
      onUsernameSave={noop}
      onCoverClick={noop}        // fullscreen tetikleniyorsa içeride yönetiliyor
      onOpenCoverEdit={noop}     // kamera ikonu zaten gizli
    />
  );
}
