import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  X,
  Edit3,
  Check,
  Package,
  MapPin,
  Clock,
  ExternalLink,
  Plus,
  Search,
  Tag,
  GraduationCap,
  Hash,
  Layers,
  Building2,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';
import { PortalItem } from '../data/portalItems';
import { ItemImageWithFallback } from './ItemImageWithFallback';

export interface UserProfileData {
  name: string;
  email: string;
  rollNo: string;
  faculty: string;
  year: string;
  division: string;
  photoUrl?: string;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfileData;
  onUpdateProfile: (updated: UserProfileData) => void;
  postedItems: PortalItem[];
  claimedItems: PortalItem[];
  onSelectItem: (item: PortalItem) => void;
  onOpenReportModal: () => void;
}

const COMMON_FACULTIES = [
  'Information Technology (IT)',
  'Computer Science (CS)',
  'Biotechnology',
  'Commerce (B.Com / BAF / BBI)',
  'Management (BMS / BBA)',
  'Science (B.Sc)',
  'Arts (B.A)',
  'Other'
];

const STANDARD_YEARS = [
  { value: 'FY', label: 'FY (1st Year)' },
  { value: 'SY', label: 'SY (2nd Year)' },
  { value: 'TY', label: 'TY (3rd Year)' }
];

const DIVISIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'Other'];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  postedItems,
  claimedItems,
  onSelectItem,
  onOpenReportModal,
}) => {
  const [activeTab, setActiveTab] = useState<'posted' | 'claimed'>('posted');
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [rollNo, setRollNo] = useState(profile.rollNo || '');
  const [faculty, setFaculty] = useState(profile.faculty || '');
  const [customFaculty, setCustomFaculty] = useState('');
  const [year, setYear] = useState(profile.year || '');
  const [division, setDivision] = useState(profile.division || '');
  const [customDivision, setCustomDivision] = useState('');
  const [photoUrl, setPhotoUrl] = useState(profile.photoUrl || '');
  const [photoError, setPhotoError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when modal opens or profile prop changes
  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
    setRollNo(profile.rollNo || '');
    setPhotoUrl(profile.photoUrl || '');
    setPhotoError('');

    const isPredefinedFaculty = COMMON_FACULTIES.includes(profile.faculty);
    if (profile.faculty && !isPredefinedFaculty) {
      setFaculty('Other');
      setCustomFaculty(profile.faculty);
    } else {
      setFaculty(profile.faculty || '');
      setCustomFaculty('');
    }

    setYear(profile.year || '');

    const isPredefinedDiv = ['A', 'B', 'C', 'D', 'E', 'F'].includes(profile.division);
    if (profile.division && !isPredefinedDiv) {
      setDivision('Other');
      setCustomDivision(profile.division);
    } else {
      setDivision(profile.division || '');
      setCustomDivision('');
    }

    // Auto-open edit mode if name is blank
    if (!profile.name.trim()) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handlePhotoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image file is too large. Maximum size is 5MB.');
      return;
    }
    setPhotoError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setPhotoUrl(result);
      }
    };
    reader.onerror = () => {
      setPhotoError('Could not process image file. Please try another.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoUpload(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handlePhotoUpload(file);
    }
  };

  const getInitials = (userName: string) => {
    if (!userName.trim()) return '';
    const parts = userName.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const resolvedFaculty = faculty === 'Other' ? customFaculty.trim() : faculty;
    const resolvedDiv = division === 'Other' ? customDivision.trim() : division;

    onUpdateProfile({
      name: name.trim(),
      email: email.trim(),
      rollNo: rollNo.trim(),
      faculty: resolvedFaculty,
      year: year.trim(),
      division: resolvedDiv,
      photoUrl: photoUrl.trim(),
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setName(profile.name);
    setEmail(profile.email);
    setRollNo(profile.rollNo || '');
    setFaculty(profile.faculty || '');
    setYear(profile.year || '');
    setDivision(profile.division || '');
    setPhotoUrl(profile.photoUrl || '');
    setPhotoError('');
    if (profile.name.trim()) {
      setIsEditing(false);
    }
  };

  const hasAcademicInfo = Boolean(
    profile.rollNo || profile.faculty || profile.year || profile.division
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-6 overflow-y-auto">
      <div
        id="user-profile-modal-container"
        className="bg-white dark:bg-[#0a0a0a] w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94dvh] sm:max-h-[92vh] border border-neutral-200/90 dark:border-neutral-800/90 animate-in fade-in zoom-in-95 duration-150 my-0 sm:my-auto text-neutral-900 dark:text-neutral-100"
      >
        {/* Mobile Sheet Drag Handle */}
        <div className="sm:hidden mobile-drag-handle bg-neutral-400 dark:bg-neutral-600 shrink-0" />

        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center font-bold shadow-xs">
              <User className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-50">
                Student Profile
              </h2>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-semibold">
                Manage personal info, department, roll number, and activity
              </p>
            </div>
          </div>
          <button
            id="btn-close-profile-modal"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-neutral-100 transition cursor-pointer"
            title="Close profile"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* User Card */}
        <div className="bg-neutral-50/80 dark:bg-neutral-900/60 p-5 sm:p-6 border-b border-neutral-200 dark:border-neutral-800 overflow-y-auto max-h-[55vh] sm:max-h-none">
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-current stroke-[2.2]" />
                  {profile.name ? 'Edit Student Details' : 'Set Up Student Profile'}
                </span>
                {profile.name.trim() && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* Profile Photo Uploader */}
              <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                    Profile Photo
                  </label>
                  {photoUrl && (
                    <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400">
                      Photo attached
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Avatar Drop Zone / Preview */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-20 h-20 rounded-2xl border-2 ${
                      isDragging
                        ? 'border-neutral-950 dark:border-white bg-neutral-200 dark:bg-neutral-800 scale-105'
                        : 'border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 hover:border-neutral-950 dark:hover:border-white'
                    } flex items-center justify-center overflow-hidden cursor-pointer relative group shrink-0 transition-all shadow-2xs`}
                    title="Click or drag an image to upload profile photo"
                  >
                    {photoUrl ? (
                      <>
                        <img
                          src={photoUrl}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                          <Camera className="w-5 h-5 stroke-[2.2] text-white" />
                          <span className="text-[9px] font-black uppercase tracking-wider mt-0.5">Change</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-neutral-500 dark:text-neutral-400 p-2 text-center">
                        <Camera className="w-6 h-6 stroke-[2] text-current mb-1" />
                        <span className="text-[10px] font-black text-current">Add Photo</span>
                      </div>
                    )}
                  </div>

                  {/* File Input & Controls */}
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileInputChange}
                      accept="image/png, image/jpeg, image/webp, image/gif"
                      className="hidden"
                    />
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{photoUrl ? 'Choose Different Photo' : 'Upload Profile Photo'}</span>
                      </button>

                      {photoUrl && (
                        <button
                          type="button"
                          onClick={() => setPhotoUrl('')}
                          className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-neutral-300 dark:border-neutral-700 active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                          <span>Remove Photo</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
                      Click to browse or drag & drop (JPG, PNG, WebP up to 5MB). Photo appears in your profile card and navbar badge.
                    </p>

                    {photoError && (
                      <p className="text-xs text-red-600 dark:text-red-400 font-bold">
                        {photoError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Name and Email */}
              {/* Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-1">
                    Student Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 focus:border-neutral-950 dark:focus:border-neutral-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:outline-none bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium transition"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-1">
                    College / Campus Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 focus:border-neutral-950 dark:focus:border-neutral-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:outline-none bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium transition"
                  />
                </div>
              </div>

              {/* Faculty / Department / Branch */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Faculty / Department / Branch (e.g. IT, CS, Biotech)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 focus:border-neutral-950 dark:focus:border-neutral-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:outline-none bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium cursor-pointer transition"
                  >
                    <option value="">-- Select Faculty / Branch --</option>
                    {COMMON_FACULTIES.map((fac) => (
                      <option key={fac} value={fac}>
                        {fac}
                      </option>
                    ))}
                  </select>

                  {faculty === 'Other' && (
                    <input
                      type="text"
                      value={customFaculty}
                      onChange={(e) => setCustomFaculty(e.target.value)}
                      placeholder="Enter faculty name (e.g. Microbiology)"
                      className="w-full text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 focus:border-neutral-950 dark:focus:border-neutral-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:outline-none bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium transition"
                      required
                    />
                  )}
                </div>
              </div>

              {/* Academic Year (Std), Division (Div), and Roll No */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* Standard / Year (FY, SY, TY) */}
                <div>
                  <label className="block text-xs font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-1">
                    Standard / Year (Std)
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 focus:border-neutral-950 dark:focus:border-neutral-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:outline-none bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium cursor-pointer transition"
                  >
                    <option value="">-- Select Std --</option>
                    {STANDARD_YEARS.map((y) => (
                      <option key={y.value} value={y.value}>
                        {y.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Division */}
                <div>
                  <label className="block text-xs font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-1">
                    Division (Div)
                  </label>
                  {division === 'Other' ? (
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={customDivision}
                        onChange={(e) => setCustomDivision(e.target.value)}
                        placeholder="e.g. Div G"
                        className="w-full text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 focus:border-neutral-950 dark:focus:border-neutral-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:outline-none bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium transition"
                      />
                      <button
                        type="button"
                        onClick={() => setDivision('')}
                        className="text-xs text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white px-1.5 font-bold"
                        title="Back to list"
                      >
                        Reset
                      </button>
                    </div>
                  ) : (
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="w-full text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 focus:border-neutral-950 dark:focus:border-neutral-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:outline-none bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium cursor-pointer transition"
                    >
                      <option value="">-- Select Div --</option>
                      {DIVISIONS.map((d) => (
                        <option key={d} value={d}>
                          {d === 'Other' ? 'Other Division...' : `Division ${d}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Roll Number */}
                <div>
                  <label className="block text-xs font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-1">
                    Roll No. / Student ID
                  </label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g. 42 or IT-2024-10"
                    className="w-full text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 focus:border-neutral-950 dark:focus:border-neutral-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:outline-none bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium transition"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                {profile.name.trim() && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3.5 py-1.5 text-xs font-black text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-lg transition cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="px-4 py-1.5 text-xs font-black text-white bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition flex items-center gap-1.5 shadow-xs border border-neutral-950 dark:border-white cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Save Student Profile</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-black text-xl shadow-md shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-700">
                      {profile.photoUrl ? (
                        <img
                          src={profile.photoUrl}
                          alt={profile.name || 'User Profile'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getInitials(profile.name) || <User className="w-6 h-6 stroke-[2.2]" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(true);
                        setTimeout(() => fileInputRef.current?.click(), 100);
                      }}
                      className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center shadow-md border-2 border-white dark:border-black hover:scale-110 transition cursor-pointer"
                      title={profile.photoUrl ? 'Change Profile Photo' : 'Add Profile Photo'}
                    >
                      <Camera className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-neutral-50">
                      {profile.name || 'Guest User'}
                    </h3>
                    {profile.email ? (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold mt-0.5">
                        {profile.email}
                      </p>
                    ) : (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold mt-0.5 italic">
                        No email configured
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-edit-profile-trigger"
                  onClick={() => setIsEditing(true)}
                  className="self-start sm:self-center flex items-center gap-1.5 text-xs font-black text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 transition shadow-2xs cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-current stroke-[2.2]" />
                  <span>Edit Profile</span>
                </button>
              </div>

              {/* Student Academic Details Banner */}
              {hasAcademicInfo ? (
                <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-wrap items-center gap-2 text-xs">
                  {profile.faculty && (
                    <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-black px-2.5 py-1 rounded-xl border border-neutral-200 dark:border-neutral-700">
                      <Building2 className="w-3.5 h-3.5 text-current stroke-[2.2]" />
                      <span>{profile.faculty}</span>
                    </div>
                  )}

                  {profile.year && (
                    <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-black px-2.5 py-1 rounded-xl border border-neutral-200 dark:border-neutral-700">
                      <GraduationCap className="w-3.5 h-3.5 text-current stroke-[2.2]" />
                      <span>{profile.year} Student</span>
                    </div>
                  )}

                  {profile.division && (
                    <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-black px-2.5 py-1 rounded-xl border border-neutral-200 dark:border-neutral-700">
                      <Layers className="w-3.5 h-3.5 text-current stroke-[2.2]" />
                      <span>Div {profile.division}</span>
                    </div>
                  )}

                  {profile.rollNo && (
                    <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-black px-2.5 py-1 rounded-xl border border-neutral-200 dark:border-neutral-700">
                      <Hash className="w-3.5 h-3.5 text-current stroke-[2.2]" />
                      <span>Roll No: {profile.rollNo}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-neutral-900 p-3 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-current stroke-[2.2]" />
                    No academic details added (Roll No, Year, Div, Faculty)
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-neutral-900 dark:text-neutral-100 underline font-black"
                  >
                    Add Academic Details
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Real Metrics Only */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
              <span className="text-[11px] font-black text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Items Posted
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-neutral-900 dark:text-neutral-100">
                  {postedItems.length}
                </span>
                <span className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold">reports</span>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
              <span className="text-[11px] font-black text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Claims Submitted
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-neutral-900 dark:text-neutral-100">
                  {claimedItems.length}
                </span>
                <span className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold">claims</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-5 sm:px-6 pt-3 border-b border-neutral-200/90 dark:border-neutral-800/90 flex items-center gap-2 bg-neutral-50/80 dark:bg-neutral-900/60">
          <button
            id="tab-my-posted-items"
            type="button"
            onClick={() => setActiveTab('posted')}
            className={`pb-3 px-3 text-xs sm:text-sm font-black flex items-center gap-2 transition border-b-2 cursor-pointer ${
              activeTab === 'posted'
                ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <Package className="w-4 h-4 text-neutral-900 dark:text-white stroke-[2.2]" />
            <span>My Posted Items</span>
            <span
              className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                activeTab === 'posted'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {postedItems.length}
            </span>
          </button>

          <button
            id="tab-my-claimed-items"
            type="button"
            onClick={() => setActiveTab('claimed')}
            className={`pb-3 px-3 text-xs sm:text-sm font-black flex items-center gap-2 transition border-b-2 cursor-pointer ${
              activeTab === 'claimed'
                ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4 text-neutral-900 dark:text-white stroke-[2.2]" />
            <span>Items I Claimed</span>
            <span
              className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                activeTab === 'claimed'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {claimedItems.length}
            </span>
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3 min-h-[200px] bg-neutral-50/40 dark:bg-neutral-900/30">
          {activeTab === 'posted' ? (
            postedItems.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-200/80 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 mx-auto flex items-center justify-center border border-neutral-300/80 dark:border-neutral-700/80">
                  <Package className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h4 className="text-sm font-black text-neutral-900 dark:text-white">
                  No Posted Items
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold max-w-sm mx-auto leading-relaxed">
                  You have not submitted any lost or found reports yet.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenReportModal();
                    }}
                    className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-black px-4 py-2 rounded-xl shadow-xs transition cursor-pointer border border-transparent dark:border-neutral-200"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Report an Item</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {postedItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onClose();
                      onSelectItem(item);
                    }}
                    className="group bg-white dark:bg-neutral-900/90 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 p-3.5 sm:p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/90 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs hover:shadow-md transition flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/90 dark:border-neutral-800/90 shrink-0 shadow-2xs">
                        <ItemImageWithFallback
                          src={item.imageUrl}
                          alt={item.title}
                          category={item.category}
                          itemType={item.type}
                          variant="thumb"
                          imgClassName="group-hover:scale-105"
                        />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                              item.type === 'found'
                                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-900 dark:border-white'
                                : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700'
                            }`}
                          >
                            {item.type === 'found' ? 'Found' : 'Lost'}
                          </span>
                          <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 capitalize">
                            {item.category.replace('_', ' ')}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${
                              item.status === 'claimed'
                                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-900 dark:border-white'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-neutral-200 dark:border-neutral-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-black text-neutral-900 dark:text-white group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition truncate">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400 font-semibold">
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-200 shrink-0 stroke-[2.2]" />
                            {item.location}
                          </span>
                          <span className="flex items-center gap-1 shrink-0">
                            <Clock className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-200 stroke-[2.2]" />
                            {item.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 text-xs font-black text-neutral-900 dark:text-white group-hover:translate-x-1 transition">
                      <span className="hidden sm:inline">View Details</span>
                      <ExternalLink className="w-4 h-4 stroke-[2.2]" />
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            claimedItems.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-200/80 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 mx-auto flex items-center justify-center border border-neutral-300/80 dark:border-neutral-700/80">
                  <Tag className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h4 className="text-sm font-black text-neutral-900 dark:text-white">
                  No Claimed Items
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold max-w-sm mx-auto leading-relaxed">
                  You have not submitted any recovery claims yet.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-black px-4 py-2 rounded-xl shadow-xs transition cursor-pointer border border-transparent dark:border-neutral-200"
                  >
                    <Search className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Browse Registry Feed</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {claimedItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onClose();
                      onSelectItem(item);
                    }}
                    className="group bg-white dark:bg-neutral-900/90 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 p-3.5 sm:p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/90 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs hover:shadow-md transition flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/90 dark:border-neutral-800/90 shrink-0 shadow-2xs">
                        <ItemImageWithFallback
                          src={item.imageUrl}
                          alt={item.title}
                          category={item.category}
                          itemType={item.type}
                          variant="thumb"
                          imgClassName="group-hover:scale-105"
                        />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            Claim Submitted
                          </span>
                          <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 capitalize">
                            {item.category.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-black text-neutral-900 dark:text-white group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition truncate">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400 font-semibold">
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-200 shrink-0 stroke-[2.2]" />
                            {item.location}
                          </span>
                          <span className="flex items-center gap-1 shrink-0">
                            <Clock className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-200 stroke-[2.2]" />
                            {item.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 text-xs font-black text-neutral-900 dark:text-white group-hover:translate-x-1 transition">
                      <span className="hidden sm:inline">Inspect Item</span>
                      <ExternalLink className="w-4 h-4 stroke-[2.2]" />
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-200/90 dark:border-neutral-800/90 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between text-xs text-neutral-700 dark:text-neutral-400 font-semibold">
          <span>
            {profile.name ? (
              <>Student: <strong className="text-neutral-900 dark:text-neutral-100 font-black">{profile.name}</strong> {profile.rollNo && `(#${profile.rollNo})`}</>
            ) : (
              <span className="italic">No student profile configured</span>
            )}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-black px-4 py-2 rounded-xl border border-neutral-200/90 dark:border-neutral-800/90 hover:border-neutral-300 dark:hover:border-neutral-700 transition cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
