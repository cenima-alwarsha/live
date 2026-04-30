import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  get,
  getDatabase,
  limitToLast,
  onChildAdded,
  onDisconnect,
  onValue,
  push,
  query,
  ref,
  remove,
  set,
  update,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCBD2JPX9bxHE5ghjmFnhsRB1PPFVRblzw",
  authDomain: "warsha-f82c8.firebaseapp.com",
  databaseURL: "https://warsha-f82c8-default-rtdb.firebaseio.com",
  projectId: "warsha-f82c8",
  storageBucket: "warsha-f82c8.firebasestorage.app",
  messagingSenderId: "703430746280",
  appId: "1:703430746280:web:3e4b150505bc2d2c8a229d",
  measurementId: "G-0MB4B0H3YY",
};

const ROUTE_STORAGE_KEY = "cinema-al-warsha-route";
const NAME_STORAGE_KEY = "cinema-al-warsha-name";
const SESSION_STORAGE_KEY = "cinema-al-warsha-sessions";
const ACTIVE_ROOM_STORAGE_KEY = "cinema-al-warsha-active-room";
const VIEWER_START_STORAGE_KEY = "cinema-al-warsha-viewer-starts";
const HOST_MEDIA_DB_NAME = "cinema-al-warsha-db";
const HOST_MEDIA_STORE_NAME = "host-media";
const YOUTUBE_SEARCH_API_KEY = firebaseConfig.apiKey;
const IDLE_ROOM_TTL_MS = 30 * 60 * 1000;
const ACTIVITY_TOUCH_INTERVAL_MS = 30 * 1000;
const IDLE_CLEANUP_INTERVAL_MS = 60 * 1000;
const SECRET_LIBRARY_TAPS = 5;
const SECRET_LIBRARY_TAP_WINDOW_MS = 1200;
const VIEWER_JOIN_GATE_MS = 10000;
const MAX_VIDEO_UPLOAD_SIZE = 10 * 1024 * 1024 * 1024;
const HOST_VIDEO_MAX_FRAMERATE = 30;
const HOST_VIDEO_HIGH_BITRATE = 8_000_000;
const HOST_VIDEO_MEDIUM_BITRATE = 5_000_000;
const HOST_VIDEO_LOW_BITRATE = 3_000_000;
const HOST_VIDEO_MIN_BITRATE = 2_000_000;

const RTC_CONFIGURATION = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
    },
  ],
};

const ICONS = {
  play: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 6.5v11l9-5.5-9-5.5Z" />
    </svg>
  `,
  pause: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 5h3v14H7V5Zm7 0h3v14h-3V5Z" />
    </svg>
  `,
  expand: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10V4h6v2H6v4H4Zm10-6h6v6h-2V6h-4V4ZM4 20v-6h2v4h4v2H4Zm14-2v-4h2v6h-6v-2h4Z" />
    </svg>
  `,
  collapse: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 8V4H6v6h6V8H8Zm8 0h-4v2h6V4h-2v4ZM8 16h4v-2H6v6h2v-4Zm8 0v4h2v-6h-6v2h4Z" />
    </svg>
  `,
  reply: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 7V3L3 10l7 7v-4h4.2c2.6 0 4.6 1 6 3 .3.4.9.2.8-.3-.7-5.4-3.8-8.7-8.7-8.7H10Z" />
    </svg>
  `,
  mic: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 14.5c1.7 0 3-1.3 3-3V6c0-1.7-1.3-3-3-3S9 4.3 9 6v5.5c0 1.7 1.3 3 3 3Zm5.5-3c0 3-2.1 5.4-5 5.9V20h3v2h-7v-2h3v-2.6c-2.9-.5-5-2.9-5-5.9h2c0 2.5 1.5 4 3.5 4s3.5-1.5 3.5-4h2Z" />
    </svg>
  `,
};

const dom = {
  connectingScreen: document.getElementById("connectingScreen"),
  homeScreen: document.getElementById("homeScreen"),
  uploadScreen: document.getElementById("uploadScreen"),
  libraryScreen: document.getElementById("libraryScreen"),
  roomScreen: document.getElementById("roomScreen"),
  homeHeading: document.getElementById("homeHeading"),
  homeSubtitle: document.getElementById("homeSubtitle"),
  roomCodeHint: document.getElementById("roomCodeHint"),
  identityForm: document.getElementById("identityForm"),
  displayNameInput: document.getElementById("displayNameInput"),
  identitySubmitButton: document.getElementById("identitySubmitButton"),
  openJoinRoomButton: document.getElementById("openJoinRoomButton"),
  leaveJoinLinkButton: document.getElementById("leaveJoinLinkButton"),
  openLibraryButton: document.getElementById("openLibraryButton"),
  joinRoomModal: document.getElementById("joinRoomModal"),
  joinRoomForm: document.getElementById("joinRoomForm"),
  joinRoomInput: document.getElementById("joinRoomInput"),
  closeJoinRoomButton: document.getElementById("closeJoinRoomButton"),
  movieFileInput: document.getElementById("movieFileInput"),
  uploadStatusCard: document.getElementById("uploadStatusCard"),
  uploadFileName: document.getElementById("uploadFileName"),
  uploadProgressLabel: document.getElementById("uploadProgressLabel"),
  uploadSpeedLabel: document.getElementById("uploadSpeedLabel"),
  uploadProgressBar: document.getElementById("uploadProgressBar"),
  uploadHint: document.getElementById("uploadHint"),
  uploadBackButton: document.getElementById("uploadBackButton"),
  cancelRoomButton: document.getElementById("cancelRoomButton"),
  chooseLibraryButton: document.getElementById("chooseLibraryButton"),
  libraryTitle: document.getElementById("libraryTitle"),
  libraryBackButton: document.getElementById("libraryBackButton"),
  addLibraryVideoButton: document.getElementById("addLibraryVideoButton"),
  libraryFileInput: document.getElementById("libraryFileInput"),
  libraryUploadStatusCard: document.getElementById("libraryUploadStatusCard"),
  libraryUploadFileName: document.getElementById("libraryUploadFileName"),
  libraryUploadProgressLabel: document.getElementById("libraryUploadProgressLabel"),
  libraryUploadSpeedLabel: document.getElementById("libraryUploadSpeedLabel"),
  libraryUploadProgressBar: document.getElementById("libraryUploadProgressBar"),
  libraryList: document.getElementById("libraryList"),
  youtubeForm: document.getElementById("youtubeForm"),
  youtubeUrlInput: document.getElementById("youtubeUrlInput"),
  youtubeSubmitButton: document.getElementById("youtubeSubmitButton"),
  youtubeSearchResults: document.getElementById("youtubeSearchResults"),
  roomCodeBadge: document.getElementById("roomCodeBadge"),
  livePill: document.getElementById("livePill"),
  hostMenuWrap: document.getElementById("hostMenuWrap"),
  hostMenuButton: document.getElementById("hostMenuButton"),
  hostMenuPanel: document.getElementById("hostMenuPanel"),
  copyRoomLinkButton: document.getElementById("copyRoomLinkButton"),
  profileButton: document.getElementById("profileButton"),
  profileAvatarSmall: document.getElementById("profileAvatarSmall"),
  profileNameSmall: document.getElementById("profileNameSmall"),
  viewerCountPill: document.getElementById("viewerCountPill"),
  viewerCountValue: document.getElementById("viewerCountValue"),
  mediaShell: document.getElementById("mediaShell"),
  hostVideo: document.getElementById("hostVideo"),
  remoteVideo: document.getElementById("remoteVideo"),
  remoteAudio: document.getElementById("remoteAudio"),
  hostBroadcastCanvas: document.getElementById("hostBroadcastCanvas"),
  viewerCanvas: document.getElementById("viewerCanvas"),
  youtubeShell: document.getElementById("youtubeShell"),
  youtubePlayerMount: document.getElementById("youtubePlayerMount"),
  youtubeInteractionBlocker: document.getElementById("youtubeInteractionBlocker"),
  waitingState: document.getElementById("waitingState"),
  waitingTitle: document.getElementById("waitingTitle"),
  waitingText: document.getElementById("waitingText"),
  viewerControls: document.getElementById("viewerControls"),
  viewerCurrentTime: document.getElementById("viewerCurrentTime"),
  viewerRemainingTime: document.getElementById("viewerRemainingTime"),
  viewerPlayStatusButton: document.getElementById("viewerPlayStatusButton"),
  viewerPlaybackNotice: document.getElementById("viewerPlaybackNotice"),
  viewerSeekBar: document.getElementById("viewerSeekBar"),
  focusChatButton: document.getElementById("focusChatButton"),
  viewerFullscreenButton: document.getElementById("viewerFullscreenButton"),
  playUnlockOverlay: document.getElementById("playUnlockOverlay"),
  unlockPlaybackButton: document.getElementById("unlockPlaybackButton"),
  bufferingOverlay: document.getElementById("bufferingOverlay"),
  bufferingLabel: document.getElementById("bufferingLabel") || document.querySelector(".buffering-label"),
  bufferingWaitNote: document.getElementById("bufferingWaitNote"),
  bufferingCountdown: document.getElementById("bufferingCountdown"),
  bufferingAudioUnlockButton: document.getElementById("bufferingAudioUnlockButton"),
  hostControlsOverlay: document.getElementById("hostControlsOverlay"),
  hostMovieName: document.getElementById("hostMovieName"),
  hostTimeLabel: document.getElementById("hostTimeLabel"),
  hostPlayPauseButton: document.getElementById("hostPlayPauseButton"),
  hostSkipBackwardButton: document.getElementById("hostSkipBackwardButton"),
  hostSkipForwardButton: document.getElementById("hostSkipForwardButton"),
  hostFullscreenButton: document.getElementById("hostFullscreenButton"),
  replaceMovieButton: document.getElementById("replaceMovieButton"),
  hostSeekBar: document.getElementById("hostSeekBar"),
  hostSeekTooltip: document.getElementById("hostSeekTooltip"),
  theaterChatOverlay: document.getElementById("theaterChatOverlay"),
  hostReloadNotice: document.getElementById("hostReloadNotice"),
  chatSection: document.getElementById("chatSection"),
  membersCountBadge: document.getElementById("membersCountBadge"),
  messagesList: document.getElementById("messagesList"),
  replyPreview: document.getElementById("replyPreview"),
  replyPreviewName: document.getElementById("replyPreviewName"),
  replyPreviewText: document.getElementById("replyPreviewText"),
  cancelReplyButton: document.getElementById("cancelReplyButton"),
  chatForm: document.getElementById("chatForm"),
  chatInput: document.getElementById("chatInput"),
  micToggleButton: document.getElementById("micToggleButton"),
  profileDrawer: document.getElementById("profileDrawer"),
  closeDrawerButton: document.getElementById("closeDrawerButton"),
  drawerAvatar: document.getElementById("drawerAvatar"),
  drawerNameLabel: document.getElementById("drawerNameLabel"),
  drawerRoleLabel: document.getElementById("drawerRoleLabel"),
  renameForm: document.getElementById("renameForm"),
  renameInput: document.getElementById("renameInput"),
  renameSaveButton: document.getElementById("renameSaveButton"),
  leaveRoomButton: document.getElementById("leaveRoomButton"),
  participantsList: document.getElementById("participantsList"),
  membersDrawer: document.getElementById("membersDrawer"),
  closeMembersDrawerButton: document.getElementById("closeMembersDrawerButton"),
  confirmModal: document.getElementById("confirmModal"),
  confirmTitle: document.getElementById("confirmTitle"),
  confirmMessage: document.getElementById("confirmMessage"),
  confirmCancelButton: document.getElementById("confirmCancelButton"),
  confirmApproveButton: document.getElementById("confirmApproveButton"),
  libraryRenameModal: document.getElementById("libraryRenameModal"),
  closeLibraryRenameButton: document.getElementById("closeLibraryRenameButton"),
  libraryRenameForm: document.getElementById("libraryRenameForm"),
  libraryRenameInput: document.getElementById("libraryRenameInput"),
  toast: document.getElementById("toast"),
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);
const storage = getStorage(firebaseApp);
let hostMediaDbPromise = null;

const state = {
  routeRoomId: null,
  roomId: null,
  roomData: null,
  members: new Map(),
  knownMemberIds: new Set(),
  messageIds: new Set(),
  listeners: [],
  pendingViewers: new Set(),
  peers: new Map(),
  viewerMixes: new Map(),
  remoteSources: new Map(),
  memberId: null,
  name: loadPreferredName(),
  avatar: "",
  isHost: false,
  micEnabled: false,
  joinedAt: 0,
  presenceReady: false,
  localPrepared: false,
  viewerRemoteStream: null,
  viewerLoopFrame: null,
  viewerControlsTimer: null,
  hostControlsTimer: null,
  hostSeekTooltipTimer: null,
  hostSeekToken: 0,
  hostSyncSuppressed: false,
  localBuffering: false,
  lastBufferingSyncAt: 0,
  viewerStorageSyncing: false,
  viewerStorageInitialSynced: false,
  viewerInitialLoadActive: false,
  viewerBufferingTimer: null,
  viewerJoinGateActive: false,
  viewerJoinGateReady: false,
  viewerJoinGatePrerollStarted: false,
  viewerJoinGateMutedBeforePreroll: false,
  viewerJoinGateAudioBlocked: false,
  viewerJoinGateAwaitingStart: false,
  viewerJoinGateUntil: 0,
  viewerJoinGateTargetTime: 0,
  viewerJoinGateTimer: null,
  viewerJoinGateToken: 0,
  viewerCatchupTimer: null,
  viewerPausedPreparedPath: "",
  viewerPausedPreparedTime: 0,
  viewerPausedPreparedAt: 0,
  viewerReconnectTimer: null,
  viewerMicTrack: null,
  viewerMicSender: null,
  viewerSilentTrack: null,
  viewerAudioContext: null,
  hostAudioContext: null,
  hostCaptureStream: null,
  hostVideoTrack: null,
  hostVideoRenderLoop: null,
  pendingUploadMode: "",
  lastStorageMediaPath: "",
  wakeLock: null,
  youtubeApiPromise: null,
  youtubePlayer: null,
  youtubePlayerReadyPromise: null,
  youtubePlayerReadyResolver: null,
  youtubeVideoId: "",
  youtubeSyncTimer: null,
  youtubeApplyingSync: false,
  youtubeSearchTimer: null,
  youtubeSearchAbortController: null,
  youtubeSearchRequestId: 0,
  youtubeSearchQuery: "",
  youtubeSearchNextPageToken: "",
  youtubeSearchLoading: false,
  youtubeSearchHasMore: false,
  youtubeSearchVideoIds: new Set(),
  libraryItems: [],
  libraryReturnScreen: "home",
  librarySelectMode: false,
  librarySelectingItemId: "",
  libraryRenameItemId: "",
  libraryTapCount: 0,
  lastLibraryTapAt: 0,
  libraryUnlocked: false,
  movieSourceNode: null,
  movieMonitorConnected: false,
  hostMicTrack: null,
  hostMicSourceNode: null,
  hostMonitors: new Map(),
  toastTimer: null,
  confirmResolver: null,
  lastViewerReadyAt: 0,
  lastSyncSentAt: 0,
  lastSyncSignature: "",
  lastActivitySentAt: 0,
  idleCleanupTimer: null,
  lastVisibilityToastAt: 0,
  replyDraft: null,
  uploadProgress: 0,
  screen: "home",
  hostMedia: {
    source: "",
    file: null,
    fileUrl: "",
    name: "",
    size: 0,
    duration: 0,
    youtubeId: "",
    youtubeUrl: "",
    storagePath: "",
    url: "",
    contentType: "",
  },
};

restorePrettyRoute();
attachEvents();
startIdleCleanup();
boot().catch((error) => {
  console.error(error);
  switchScreen("home");
  showToast(getFriendlyErrorMessage(error));
});

async function boot() {
  state.routeRoomId = getRoomIdFromLocation();
  if (!state.routeRoomId) {
    const activeSession = getActiveRoomSession();
    if (activeSession?.roomId) {
      state.routeRoomId = activeSession.roomId;
      history.replaceState({}, "", buildRoomUrl(activeSession.roomId));
    }
  }
  dom.displayNameInput.value = state.name;
  updateHomeMode();
  updateMicButton();
  syncViewerExpandState();
  syncRenameSaveVisibility();

  if (!state.routeRoomId) {
    switchScreen("home");
    return;
  }

  const session = getRoomSession(state.routeRoomId) || recoverRouteSession(state.routeRoomId);
  if (!session) {
    switchScreen("home");
    return;
  }

  let restoredHostMedia = false;
  if (session.isHost) {
    restoredHostMedia = await restorePersistedHostMovie(session.roomId).catch((error) => {
      console.warn("restore host media failed", error);
      return false;
    });
  }

  await joinRoom(state.routeRoomId, session.name, session);

  if (restoredHostMedia) {
    await resumeRestoredHostPlayback();
  }
}

function attachEvents() {
  dom.identityForm.addEventListener("submit", handleIdentitySubmit);
  dom.openJoinRoomButton.addEventListener("click", openJoinRoomModal);
  dom.leaveJoinLinkButton.addEventListener("click", leaveJoinLinkPage);
  dom.openLibraryButton.addEventListener("click", openLibraryFromHome);
  dom.closeJoinRoomButton.addEventListener("click", closeJoinRoomModal);
  dom.joinRoomForm.addEventListener("submit", handleJoinRoomSubmit);
  dom.joinRoomInput.addEventListener("input", handleJoinRoomInput);
  dom.movieFileInput.addEventListener("change", handleMovieFileChange);
  dom.uploadBackButton.addEventListener("click", returnToRoomFromUpload);
  dom.cancelRoomButton.addEventListener("click", handleCancelRoom);
  dom.chooseLibraryButton.addEventListener("click", openLibraryPicker);
  dom.libraryBackButton.addEventListener("click", handleLibraryBack);
  dom.addLibraryVideoButton.addEventListener("click", () => dom.libraryFileInput.click());
  dom.libraryFileInput.addEventListener("change", handleLibraryFileChange);
  dom.closeLibraryRenameButton.addEventListener("click", closeLibraryRenameModal);
  dom.libraryRenameForm.addEventListener("submit", handleLibraryRenameSubmit);
  dom.youtubeForm.addEventListener("submit", handleYoutubeSubmit);
  dom.youtubeUrlInput.addEventListener("input", handleYoutubeInput);
  dom.youtubeSearchResults.addEventListener("scroll", handleYoutubeResultsScroll);
  dom.hostMenuButton.addEventListener("click", toggleHostMenu);
  dom.copyRoomLinkButton.addEventListener("click", copyRoomLink);
  dom.profileButton.addEventListener("click", openDrawer);
  dom.viewerCountPill.addEventListener("click", openMembersDrawer);
  dom.viewerCountPill.addEventListener("keydown", handleMembersPillKeydown);
  dom.closeDrawerButton.addEventListener("click", closeDrawer);
  dom.closeMembersDrawerButton.addEventListener("click", closeMembersDrawer);
  dom.renameForm.addEventListener("submit", handleRenameSubmit);
  dom.renameInput.addEventListener("input", syncRenameSaveVisibility);
  dom.leaveRoomButton.addEventListener("click", handleLeaveRoom);
  dom.cancelReplyButton.addEventListener("click", cancelReply);
  dom.chatForm.addEventListener("submit", handleSendMessage);
  dom.micToggleButton.addEventListener("click", handleMicToggle);
  dom.viewerFullscreenButton.addEventListener("click", toggleViewerFullscreen);
  dom.focusChatButton.addEventListener("click", focusChatComposer);
  dom.unlockPlaybackButton.addEventListener("click", attemptRemotePlayback);
  dom.bufferingAudioUnlockButton?.addEventListener("click", () => {
    handleViewerJoinGateAudioUnlock().catch((error) => console.error("audio unlock failed", error));
  });
  dom.bufferingOverlay?.addEventListener("click", (event) => {
    if (
      event.target.closest("button") ||
      (!state.viewerJoinGateAudioBlocked && !state.viewerJoinGateAwaitingStart)
    ) {
      return;
    }
    handleViewerJoinGateAudioUnlock().catch((error) => console.error("audio unlock failed", error));
  });
  dom.replaceMovieButton.addEventListener("click", () => {
    openMediaChooser();
  });
  dom.hostPlayPauseButton.addEventListener("click", async () => {
    revealHostControls();
    await toggleHostPlayback();
  });
  dom.hostSkipBackwardButton.addEventListener("click", () => {
    revealHostControls();
    skipHostBy(-10);
  });
  dom.hostSkipForwardButton.addEventListener("click", () => {
    revealHostControls();
    skipHostBy(10);
  });
  dom.hostFullscreenButton.addEventListener("click", async () => {
    revealHostControls();
    await toggleMediaFullscreen();
  });
  dom.hostSeekBar.addEventListener("input", () => {
    revealHostControls();
    setHostSeekProgress(dom.hostSeekBar.value);
  });
  dom.hostSeekBar.addEventListener("pointerenter", handleHostSeekPreview);
  dom.hostSeekBar.addEventListener("pointermove", handleHostSeekPreview);
  dom.hostSeekBar.addEventListener("pointerleave", hideHostSeekPreview);
  dom.hostSeekBar.addEventListener("pointercancel", hideHostSeekPreview);
  dom.hostSeekBar.addEventListener("pointerdown", handleHostSeekPointerDown);
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  document.addEventListener("pointerdown", handleSecretLibraryTap);

  dom.hostVideo.addEventListener("loadedmetadata", () => {
    updateHostPlaybackUi();
    syncHostPlayback(true);
  });
  dom.hostVideo.addEventListener("waiting", () => handleHostBufferingEvent(true));
  dom.hostVideo.addEventListener("stalled", () => handleHostBufferingEvent(true));
  dom.hostVideo.addEventListener("canplay", () => handleHostBufferingEvent(false));
  dom.hostVideo.addEventListener("playing", () => handleHostBufferingEvent(false));
  dom.hostVideo.addEventListener("timeupdate", () => {
    updateHostPlaybackUi();
    syncHostPlayback(false);
  });
  dom.hostVideo.addEventListener("seeked", () => {
    updateHostPlaybackUi();
    syncHostPlayback(true);
  });
  dom.hostVideo.addEventListener("play", () => {
    updateHostPlaybackUi();
    syncHostPlayback(true);
    requestHostWakeLock();
  });
  dom.hostVideo.addEventListener("pause", () => {
    if (!state.hostSyncSuppressed) {
      setLocalBuffering(false);
    }
    updateHostPlaybackUi();
    syncHostPlayback(true);
    releaseHostWakeLock();
  });
  dom.hostVideo.addEventListener("ended", () => {
    if (!state.hostSyncSuppressed) {
      setLocalBuffering(false);
    }
    updateHostPlaybackUi();
    syncHostPlayback(true);
    releaseHostWakeLock();
    playQueuedFilmIfReady().catch((error) => console.error("queue promote failed", error));
  });

  dom.remoteVideo.addEventListener("loadedmetadata", () => {
    handleViewerBufferingEvent(true);
    if (!state.isHost && isStorageMode() && (state.viewerInitialLoadActive || isViewerJoinGateActive())) {
      revealViewerControls();
      updateWaitingOverlay();
      return;
    }
    attemptRemotePlayback({ force: true });
    revealViewerControls();
    updateWaitingOverlay();
  });
  dom.remoteVideo.addEventListener("loadstart", () => handleViewerBufferingEvent(true));
  dom.remoteVideo.addEventListener("waiting", () => handleViewerBufferingEvent(true));
  dom.remoteVideo.addEventListener("stalled", () => handleViewerBufferingEvent(true));
  dom.remoteVideo.addEventListener("seeking", () => handleViewerBufferingEvent(true));
  dom.remoteVideo.addEventListener("loadeddata", () => handleViewerBufferingEvent(false));
  dom.remoteVideo.addEventListener("canplay", () => handleViewerBufferingEvent(false));
  dom.remoteVideo.addEventListener("playing", () => handleViewerBufferingEvent(false));
  dom.remoteVideo.addEventListener("seeked", () => handleViewerBufferingEvent(false));

  dom.mediaShell.addEventListener("click", (event) => {
    if (event.target.closest("button") || event.target.closest("input")) {
      return;
    }
    if (state.isHost) {
      toggleHostControls();
      return;
    }
    if (isYoutubeMode()) {
      if (!dom.playUnlockOverlay.classList.contains("hidden")) {
        attemptRemotePlayback();
      }
      toggleViewerControls();
      return;
    }
    if (shouldAttemptViewerPlaybackOnTap()) {
      attemptRemotePlayback();
    }
    toggleViewerControls();
  });

  dom.confirmCancelButton.addEventListener("click", () => resolveConfirm(false));
  dom.confirmApproveButton.addEventListener("click", () => resolveConfirm(true));

  document.addEventListener("click", (event) => {
    if (!event.target.closest("#hostMenuWrap")) {
      dom.hostMenuPanel.classList.add("hidden");
    }
    if (!event.target.closest("#profileDrawer") && !event.target.closest("#profileButton")) {
      closeDrawer();
    }
    if (!event.target.closest("#membersDrawer") && !event.target.closest("#viewerCountPill")) {
      closeMembersDrawer();
    }
    if (
      !dom.joinRoomModal.classList.contains("hidden") &&
      event.target === dom.joinRoomModal
    ) {
      closeJoinRoomModal();
    }
    if (
      !dom.libraryRenameModal.classList.contains("hidden") &&
      event.target === dom.libraryRenameModal
    ) {
      closeLibraryRenameModal();
    }
  });

  window.addEventListener("resize", () => {
    positionProfileDrawer();
    positionMembersDrawer();
  });

  window.addEventListener("beforeunload", cleanupMediaResources);
}

async function handleIdentitySubmit(event) {
  event.preventDefault();
  const name = sanitizeName(dom.displayNameInput.value);
  if (!name) {
    showToast("اكتب اسمك أولاً.");
    dom.displayNameInput.focus();
    return;
  }

  savePreferredName(name);

  try {
    if (state.routeRoomId) {
      switchScreen("connecting");
      await joinRoom(state.routeRoomId, name, getRoomSession(state.routeRoomId));
    } else {
      await createRoom(name);
    }
  } catch (error) {
    console.error(error);
    switchScreen("home");
    showToast(getFriendlyErrorMessage(error));
  }
}

function openJoinRoomModal() {
  dom.joinRoomInput.value = "";
  dom.joinRoomModal.classList.remove("hidden");
  window.setTimeout(() => dom.joinRoomInput.focus(), 0);
}

function closeJoinRoomModal() {
  dom.joinRoomModal.classList.add("hidden");
}

function leaveJoinLinkPage() {
  state.routeRoomId = null;
  history.replaceState({}, "", getBasePath());
  updateHomeMode();
  switchScreen("home");
}

function handleJoinRoomInput() {
  dom.joinRoomInput.value = normalizeRoomCodeInput(dom.joinRoomInput.value);
}

async function handleJoinRoomSubmit(event) {
  event.preventDefault();
  const name = sanitizeName(dom.displayNameInput.value);
  const roomId = normalizeRoomCodeInput(dom.joinRoomInput.value);

  dom.joinRoomInput.value = roomId;

  if (!name) {
    closeJoinRoomModal();
    showToast("اكتب اسمك أولاً.");
    dom.displayNameInput.focus();
    return;
  }

  if (!/^\d{4}$/.test(roomId)) {
    showToast("اكتب رقم الغرفة من 4 أرقام.");
    dom.joinRoomInput.focus();
    return;
  }

  savePreferredName(name);
  closeJoinRoomModal();
  state.routeRoomId = roomId;
  history.replaceState({}, "", buildRoomUrl(roomId));
  switchScreen("connecting");

  try {
    await joinRoom(roomId, name, getRoomSession(roomId));
  } catch (error) {
    console.error(error);
    state.routeRoomId = null;
    history.replaceState({}, "", getBasePath());
    updateHomeMode();
    switchScreen("home");
    showToast(getFriendlyErrorMessage(error));
  }
}

async function createRoom(name) {
  const roomId = await generateUniqueRoomId();
  const memberId = createClientId();
  const avatar = createAvatar(memberId, name);
  const now = Date.now();
  const session = {
    roomId,
    memberId,
    isHost: true,
    name,
    avatar,
  };

  await set(ref(db, `rooms/${roomId}`), {
    roomId,
    creatorId: memberId,
    creatorName: name,
    createdAt: now,
    lastActivity: now,
    status: "preparing",
    film: null,
    sync: {
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      isBuffering: false,
      updatedAt: now,
    },
  });
  await touchRoomIndex(roomId, now).catch((error) => console.warn("activity index failed", error));
  state.lastActivitySentAt = now;

  saveRoomSession(session);
  setActiveRoomId(roomId);
  state.routeRoomId = roomId;
  history.replaceState({}, "", buildRoomUrl(roomId));

  await joinRoom(roomId, name, session);
  switchScreen("upload");
  showToast("تم إنشاء الغرفة. حمّل الفيلم الآن لبدء البث.");
}

async function joinRoom(roomId, preferredName, existingSession = null) {
  const roomSnapshot = await get(ref(db, `rooms/${roomId}`));
  if (!roomSnapshot.exists()) {
    clearRoomSession(roomId);
    throw new Error("هذه الغرفة غير موجودة أو انتهت.");
  }

  const roomData = roomSnapshot.val();
  if (isRoomIdle(roomData)) {
    await deleteRoomById(roomId);
    clearRoomSession(roomId);
    throw new Error("انتهت الغرفة بسبب عدم التفاعل.");
  }

  const memberId = existingSession?.memberId || createClientId();
  const isHost = roomData.creatorId === memberId;
  const name = sanitizeName(existingSession?.name || preferredName);
  const avatar = createAvatar(memberId, name);

  const session = {
    roomId,
    memberId,
    isHost,
    name,
    avatar,
  };

  saveRoomSession(session);
  setActiveRoomId(roomId);
  state.routeRoomId = roomId;
  state.roomId = roomId;
  state.roomData = roomData;
  state.memberId = memberId;
  state.name = name;
  state.avatar = avatar;
  state.isHost = isHost;
  state.joinedAt = Date.now();
  state.messageIds.clear();
  state.members = new Map();
  state.knownMemberIds.clear();
  state.presenceReady = false;
  dom.messagesList.innerHTML = "";
  cancelReply();
  dom.renameInput.value = name;
  syncRenameSaveVisibility();

  cleanupRoomSubscriptions();
  closeAllPeers();
  cleanupViewerReconnect();

  updateProfileUi();
  updateViewerCount();
  updateRoomBadge();
  updateModeUi();

  await registerPresence();
  subscribeToRoom(roomId);

  if (state.isHost) {
    if (state.hostMedia.fileUrl || roomData?.film?.source === "youtube" || roomData?.film?.source === "storage") {
      switchScreen("room");
    } else {
      switchScreen("upload");
    }
  } else {
    switchScreen("room");
    scheduleViewerReconnect(300);
  }
}

async function registerPresence() {
  const memberRef = ref(db, `rooms/${state.roomId}/members/${state.memberId}`);
  const payload = buildMemberPayload();
  await set(memberRef, payload);

  const disconnectUnsub = onValue(ref(db, ".info/connected"), async (snapshot) => {
    if (!snapshot.val()) {
      return;
    }
    try {
      await onDisconnect(memberRef).remove();
      await set(memberRef, buildMemberPayload());
    } catch (error) {
      console.error("presence error", error);
    }
  });

  state.listeners.push(disconnectUnsub);
}

function subscribeToRoom(roomId) {
  const roomUnsub = onValue(ref(db, `rooms/${roomId}`), (snapshot) => {
    if (!snapshot.exists()) {
      clearRoomSession(roomId);
      if (state.isHost) {
        clearPersistedHostMovie(roomId).catch(() => {});
      }
      showToast("انتهت هذه الغرفة أو لم تعد متوفرة.");
      navigateHome();
      return;
    }

    state.roomData = snapshot.val();
    updateRoomBadge();
    updateModeUi();
    updateBufferingOverlay();
    updateWaitingOverlay();
    if (!isViewerJoinGateActive()) {
      renderViewerTime(state.roomData.sync);
    }
    updateViewerPlaybackUi(state.roomData.sync);
    handleRoomMediaUpdate().catch((error) => console.error("media update error", error));

    if (!state.isHost && state.roomData?.creatorId) {
      scheduleViewerReconnect(200);
    }
  });

  const membersUnsub = onValue(ref(db, `rooms/${roomId}/members`), (snapshot) => {
    const nextMembers = new Map();
    snapshot.forEach((child) => {
      nextMembers.set(child.key, {
        id: child.key,
        ...child.val(),
      });
    });
    renderPresenceEvents(nextMembers);
    state.members = nextMembers;
    renderParticipants();
    updateViewerCount();
    updateWaitingOverlay();
    retuneHostVideoSenders();
    if (!state.isHost) {
      scheduleViewerReconnect(400);
    }
  });

  const messagesQuery = query(ref(db, `rooms/${roomId}/messages`), limitToLast(160));
  const messagesUnsub = onChildAdded(messagesQuery, (snapshot) => {
    if (state.messageIds.has(snapshot.key)) {
      return;
    }
    state.messageIds.add(snapshot.key);
    renderMessage({
      id: snapshot.key,
      ...snapshot.val(),
    });
  });

  const signalsUnsub = onChildAdded(ref(db, `rooms/${roomId}/signals/${state.memberId}`), async (snapshot) => {
    const signal = snapshot.val();
    try {
      await handleSignal(signal);
    } catch (error) {
      console.error("signal error", error);
    } finally {
      remove(snapshot.ref).catch(() => {});
    }
  });

  state.listeners.push(roomUnsub, membersUnsub, messagesUnsub, signalsUnsub);
}

function cleanupRoomSubscriptions() {
  state.listeners.forEach((unsubscribe) => {
    if (typeof unsubscribe === "function") {
      unsubscribe();
    }
  });
  state.listeners = [];
}

function getRoomLastActivity(roomData) {
  return Number(roomData?.lastActivity || roomData?.sync?.updatedAt || roomData?.createdAt || 0);
}

function isRoomIdle(roomData) {
  const lastActivity = getRoomLastActivity(roomData);
  return Boolean(lastActivity && Date.now() - lastActivity > IDLE_ROOM_TTL_MS);
}

function shouldTouchRoomActivity(now = Date.now(), force = false) {
  if (!force && now - state.lastActivitySentAt < ACTIVITY_TOUCH_INTERVAL_MS) {
    return false;
  }

  state.lastActivitySentAt = now;
  return true;
}

async function touchRoomIndex(roomId, lastActivity = Date.now()) {
  if (!roomId) {
    return;
  }

  await set(ref(db, `roomIndex/${roomId}`), { lastActivity });
}

async function deleteRoomById(roomId) {
  if (!/^\d{4}$/.test(roomId || "")) {
    return;
  }

  const roomSnapshot = await get(ref(db, `rooms/${roomId}`)).catch(() => null);
  const roomData = roomSnapshot?.exists() ? roomSnapshot.val() : null;
  const storagePaths = [
    getDeletableStoragePath(roomData?.film),
    getDeletableStoragePath(roomData?.nextFilm),
  ].filter(Boolean);

  await Promise.allSettled([
    remove(ref(db, `rooms/${roomId}`)),
    remove(ref(db, `roomIndex/${roomId}`)),
    ...storagePaths.map((path) => deleteStorageFile(path)),
  ]);
}

function startIdleCleanup() {
  cleanupIdleRooms().catch((error) => console.warn("idle cleanup failed", error));
  state.idleCleanupTimer = window.setInterval(() => {
    cleanupIdleRooms().catch((error) => console.warn("idle cleanup failed", error));
  }, IDLE_CLEANUP_INTERVAL_MS);
}

async function cleanupIdleRooms() {
  const snapshot = await get(ref(db, "roomIndex")).catch(() => null);
  if (!snapshot?.exists()) {
    return;
  }

  const now = Date.now();
  const deletions = [];
  snapshot.forEach((child) => {
    const roomId = child.key;
    const lastActivity = Number(child.val()?.lastActivity || 0);
    if (/^\d{4}$/.test(roomId || "") && lastActivity && now - lastActivity > IDLE_ROOM_TTL_MS) {
      deletions.push(deleteRoomById(roomId));
    }
  });

  await Promise.allSettled(deletions);
}

function buildMemberPayload() {
  return {
    name: state.name,
    avatar: state.avatar,
    isHost: state.isHost,
    micEnabled: state.micEnabled,
    joinedAt: state.joinedAt || Date.now(),
    updatedAt: Date.now(),
  };
}

function updateRoomBadge() {
  const badgeValue = state.roomId || state.routeRoomId || "0000";
  dom.roomCodeBadge.textContent = badgeValue;
  if (dom.roomCodeHint) {
    dom.roomCodeHint.textContent = "";
    dom.roomCodeHint.classList.add("hidden");
  }
}

function updateHomeMode() {
  dom.displayNameInput.placeholder = "اسمك";
  if (state.routeRoomId) {
    dom.homeHeading.textContent = "اكتب اسمك";
    dom.homeSubtitle.textContent = "";
    dom.identitySubmitButton.textContent = "دخول الغرفة";
    dom.openJoinRoomButton.classList.add("hidden");
    dom.leaveJoinLinkButton.classList.remove("hidden");
  } else {
    dom.homeHeading.textContent = "اكتب اسمك";
    dom.homeSubtitle.textContent = "";
    dom.identitySubmitButton.textContent = "إنشاء غرفة السينما";
    dom.openJoinRoomButton.classList.remove("hidden");
    dom.leaveJoinLinkButton.classList.add("hidden");
  }
}

function switchScreen(name) {
  document.documentElement.classList.remove("resume-room");
  state.screen = name;
  dom.connectingScreen.classList.toggle("active", name === "connecting");
  dom.homeScreen.classList.toggle("active", name === "home");
  dom.uploadScreen.classList.toggle("active", name === "upload");
  dom.libraryScreen.classList.toggle("active", name === "library");
  dom.roomScreen.classList.toggle("active", name === "room");
  syncUploadBackButton();
  updateModeUi();
  if (name !== "room") {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setTheaterMode(false);
    unlockLandscapeMode();
    dom.viewerControls.classList.add("hidden");
    hideHostControls();
    dom.hostMenuPanel.classList.add("hidden");
    closeDrawer();
    closeMembersDrawer();
    closeJoinRoomModal();
    closeLibraryRenameModal();
    dom.theaterChatOverlay.innerHTML = "";
    clearViewerJoinGate();
    setLocalBuffering(false);
  }
}

function updateProfileUi() {
  dom.profileAvatarSmall.src = state.avatar;
  dom.profileNameSmall.textContent = state.name || "ضيف";
  dom.drawerAvatar.src = state.avatar;
  dom.drawerNameLabel.textContent = state.name || "ضيف";
  dom.drawerRoleLabel.textContent = "";
  dom.renameInput.value = state.name || "";
  syncRenameSaveVisibility();
}

function updateModeUi() {
  const showHostControls = state.isHost && state.localPrepared && state.screen === "room";
  const youtubeMode = isYoutubeMode();
  dom.hostMenuWrap.classList.toggle("hidden", !(state.isHost && state.roomId && state.screen === "room"));
  dom.hostVideo.classList.toggle("hidden", !showHostControls || youtubeMode);
  dom.viewerCanvas.classList.add("hidden");
  dom.remoteVideo.classList.toggle("hidden", state.isHost || youtubeMode);
  dom.youtubeShell.classList.toggle("hidden", !youtubeMode || state.screen !== "room");
  dom.hostReloadNotice.classList.toggle(
    "hidden",
    !(state.isHost && state.screen === "room" && !state.localPrepared)
  );
  if (state.isHost || !state.viewerRemoteStream) {
    dom.playUnlockOverlay.classList.add("hidden");
  }
  if (!showHostControls) {
    hideHostControls();
  }
  syncViewerExpandState();
  updateViewerPlaybackUi();
  updateWaitingOverlay();
}

function openMediaChooser() {
  if (!state.isHost) {
    return;
  }

  if (shouldQueueNextUpload()) {
    state.pendingUploadMode = "queue";
    resetUploadProgress();
    dom.hostMenuPanel.classList.add("hidden");
    switchScreen("upload");
    showToast("اختر الفيلم التالي.");
    return;
  }

  state.pendingUploadMode = "replace";
  hideHostControls();
  dom.hostMenuPanel.classList.add("hidden");
  resetUploadProgress();
  switchScreen("upload");
}

function returnToRoomFromUpload() {
  if (!state.roomId || !state.localPrepared) {
    return;
  }
  switchScreen("room");
  updateModeUi();
  revealHostControls();
}

function shouldQueueNextUpload() {
  if (!state.isHost || !state.roomId || state.screen !== "room" || !state.localPrepared) {
    return false;
  }

  const sync = state.roomData?.sync;
  const duration = Number(sync?.duration || state.hostMedia.duration || 0);
  const currentTime = Number(sync?.currentTime || dom.hostVideo.currentTime || 0);
  return Boolean(duration && currentTime < duration - 1.5);
}

async function handleCancelRoom() {
  if (!state.isHost || !state.roomId) {
    return;
  }

  const approved = await askForConfirmation(
    "إلغاء الغرفة",
    "سيتم حذف الغرفة والرجوع للصفحة الرئيسية. هل تريد المتابعة؟"
  );
  if (!approved) {
    return;
  }

  await deleteCurrentRoom("تم إلغاء الغرفة.");
}

function syncUploadBackButton() {
  dom.uploadBackButton.classList.toggle("hidden", !(state.isHost && state.localPrepared && state.roomId));
  dom.cancelRoomButton.classList.toggle("hidden", !(state.isHost && state.roomId && state.screen === "upload"));
}

function resetUploadProgress() {
  clearYoutubeSearchResults();
  dom.uploadStatusCard.classList.add("hidden");
  dom.uploadFileName.textContent = "جارٍ التحضير...";
  dom.uploadProgressLabel.textContent = "0%";
  dom.uploadSpeedLabel.textContent = "";
  dom.uploadProgressBar.style.width = "0%";
}

function handleYoutubeInput() {
  const value = dom.youtubeUrlInput.value.trim();
  clearTimeout(state.youtubeSearchTimer);

  if (!value || extractYoutubeId(value)) {
    clearYoutubeSearchResults();
    return;
  }

  if (value.length < 2) {
    clearYoutubeSearchResults();
    return;
  }

  state.youtubeSearchTimer = window.setTimeout(() => {
    searchYoutube(value).catch((error) => {
      if (error.name === "AbortError") {
        return;
      }
      console.error("youtube search error", error);
      renderYoutubeSearchMessage("تعذر البحث في يوتيوب.");
    });
  }, 450);
}

async function handleMovieFileChange(event) {
  const [file] = event.target.files || [];
  if (!file || !state.isHost) {
    return;
  }

  const mode = state.pendingUploadMode || (shouldQueueNextUpload() ? "queue" : "replace");
  state.pendingUploadMode = "";

  try {
    await prepareHostMovie(file, { mode });
  } catch (error) {
    console.error(error);
    showToast(getFriendlyErrorMessage(error));
  } finally {
    dom.movieFileInput.value = "";
  }
}

function handleSecretLibraryTap(event) {
  if (state.screen !== "home") {
    return;
  }

  if (event.target.closest("button, input, textarea, a, label, .modal, .drawer")) {
    return;
  }

  const now = Date.now();
  state.libraryTapCount = now - state.lastLibraryTapAt <= SECRET_LIBRARY_TAP_WINDOW_MS
    ? state.libraryTapCount + 1
    : 1;
  state.lastLibraryTapAt = now;

  if (state.libraryTapCount < SECRET_LIBRARY_TAPS) {
    return;
  }

  state.libraryTapCount = 0;
  state.libraryUnlocked = true;
  dom.openLibraryButton.classList.remove("hidden");
  showToast("ظهرت المكتبة.");
}

function hideSecretLibraryButton() {
  state.libraryUnlocked = false;
  state.libraryTapCount = 0;
  dom.openLibraryButton.classList.add("hidden");
}

async function openLibraryFromHome() {
  state.libraryReturnScreen = "home";
  state.librarySelectMode = false;
  await openLibraryScreen();
}

async function openLibraryPicker() {
  if (!state.isHost || !state.roomId) {
    return;
  }

  state.libraryReturnScreen = "upload";
  state.librarySelectMode = true;
  await openLibraryScreen();
}

async function openLibraryScreen() {
  resetLibraryUploadProgress();
  closeJoinRoomModal();
  closeLibraryRenameModal();
  updateLibraryHeading();
  switchScreen("library");
  await loadLibraryItems();
}

function handleLibraryBack() {
  closeLibraryRenameModal();
  if (state.libraryReturnScreen === "upload" && state.roomId) {
    state.librarySelectMode = false;
    switchScreen("upload");
    return;
  }

  state.librarySelectMode = false;
  hideSecretLibraryButton();
  switchScreen("home");
}

function updateLibraryHeading() {
  dom.libraryTitle.textContent = "المكتبة";
}

async function handleLibraryFileChange(event) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  let uploadedItem = null;
  try {
    uploadedItem = await uploadLibraryMovie(file);
    await set(ref(db, `library/${uploadedItem.id}`), uploadedItem);
    showToast("تمت إضافة الفيديو إلى المكتبة.");
    await loadLibraryItems();
  } catch (error) {
    if (uploadedItem?.storagePath) {
      deleteStorageFile(uploadedItem.storagePath).catch((deleteError) => {
        console.warn("library orphan cleanup failed", deleteError);
      });
    }
    console.error(error);
    showToast(getFriendlyErrorMessage(error));
  } finally {
    dom.libraryFileInput.value = "";
  }
}

async function uploadLibraryMovie(file) {
  if (!file.type.startsWith("video/") && !/\.(mkv|mp4|mov|webm)$/i.test(file.name)) {
    throw new Error("اختر ملف فيديو صالحاً.");
  }

  if (file.size >= MAX_VIDEO_UPLOAD_SIZE) {
    throw new Error("حجم الفيديو أكبر من الحد المسموح.");
  }

  const itemId = createLibraryItemId();
  const safeName = sanitizeStorageFileName(file.name || "movie.mp4");
  const path = `library/${itemId}/${Date.now()}-${safeName}`;
  const fileRef = storageRef(storage, path);
  const startedAt = performance.now();
  const metadataPromise = readLocalVideoMetadata(file);
  const uploadTask = uploadBytesResumable(fileRef, file, {
    contentType: file.type || "video/mp4",
    cacheControl: "public,max-age=31536000",
    customMetadata: {
      libraryItemId: itemId,
      originalName: file.name || "movie",
    },
  });

  setLibraryUploadProgress(2, file.name, "بدء الرفع");

  const snapshot = await new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (uploadSnapshot) => {
        const percent = uploadSnapshot.totalBytes
          ? (uploadSnapshot.bytesTransferred / uploadSnapshot.totalBytes) * 100
          : 0;
        const elapsed = Math.max((performance.now() - startedAt) / 1000, 0.25);
        const speed = uploadSnapshot.bytesTransferred / elapsed;
        setLibraryUploadProgress(
          Math.max(2, Math.min(percent, 99)),
          file.name,
          `${formatBytes(uploadSnapshot.bytesTransferred)} / ${formatBytes(uploadSnapshot.totalBytes)} · ${formatBytes(speed)}/ث`
        );
      },
      reject,
      () => resolve(uploadTask.snapshot)
    );
  });

  const [localMetadata, url] = await Promise.all([
    metadataPromise,
    getDownloadURL(snapshot.ref),
  ]);
  const now = Date.now();

  setLibraryUploadProgress(100, file.name, "تم الحفظ");

  return {
    id: itemId,
    source: "storage",
    storageOwner: "library",
    name: file.name || "movie",
    size: file.size || 0,
    duration: roundTime(localMetadata.duration || 0),
    storagePath: path,
    url,
    contentType: file.type || "video/mp4",
    createdAt: now,
    updatedAt: now,
  };
}

async function loadLibraryItems() {
  dom.libraryList.innerHTML = `<div class="library-message">جاري تحميل المكتبة...</div>`;

  const snapshot = await get(ref(db, "library")).catch((error) => {
    console.error("library load failed", error);
    return null;
  });

  if (!snapshot) {
    dom.libraryList.innerHTML = `<div class="library-message">تعذر تحميل المكتبة.</div>`;
    return;
  }

  if (!snapshot?.exists()) {
    state.libraryItems = [];
    renderLibraryItems();
    return;
  }

  const items = [];
  snapshot.forEach((child) => {
    items.push(normalizeLibraryItem(child.key, child.val()));
  });

  state.libraryItems = items
    .filter((item) => item.id && item.storagePath)
    .sort((a, b) => Number(b.updatedAt || b.createdAt || 0) - Number(a.updatedAt || a.createdAt || 0));
  renderLibraryItems();
}

function normalizeLibraryItem(id, value = {}) {
  return {
    id,
    source: "storage",
    storageOwner: "library",
    name: sanitizeLibraryName(value.name || "فيديو"),
    size: Number(value.size || 0),
    duration: Number(value.duration || 0),
    storagePath: value.storagePath || "",
    url: value.url || "",
    contentType: value.contentType || "video/mp4",
    createdAt: Number(value.createdAt || 0),
    updatedAt: Number(value.updatedAt || value.createdAt || 0),
  };
}

function renderLibraryItems() {
  dom.libraryList.innerHTML = "";

  if (!state.libraryItems.length) {
    const message = document.createElement("div");
    message.className = "library-message";
    message.textContent = "المكتبة فارغة.";
    dom.libraryList.append(message);
    return;
  }

  state.libraryItems.forEach((item) => {
    const card = document.createElement("article");
    card.className = "library-card";
    const isSelecting = state.librarySelectingItemId === item.id;
    const libraryBusy = Boolean(state.librarySelectingItemId);

    const info = document.createElement("div");
    info.className = "library-card-info";

    const title = document.createElement("div");
    title.className = "library-card-title";
    title.textContent = item.name;

    const meta = document.createElement("div");
    meta.className = "library-card-meta";
    meta.textContent = [formatDuration(item.duration), formatBytes(item.size)].filter(Boolean).join(" · ");

    info.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "library-card-actions";

    if (state.librarySelectMode) {
      const selectButton = document.createElement("button");
      selectButton.className = "primary-button library-card-button";
      selectButton.type = "button";
      selectButton.textContent = isSelecting ? "جاري التجهيز..." : "اختيار";
      selectButton.disabled = libraryBusy;
      selectButton.addEventListener("click", () => selectLibraryMovie(item));
      actions.append(selectButton);
    }

    const renameButton = document.createElement("button");
    renameButton.className = "secondary-button library-card-button";
    renameButton.type = "button";
    renameButton.textContent = "تعديل الاسم";
    renameButton.disabled = libraryBusy;
    renameButton.addEventListener("click", () => openLibraryRenameModal(item));

    const deleteButton = document.createElement("button");
    deleteButton.className = "danger-button library-card-button";
    deleteButton.type = "button";
    deleteButton.textContent = "حذف";
    deleteButton.disabled = libraryBusy;
    deleteButton.addEventListener("click", () => deleteLibraryItem(item));

    actions.append(renameButton, deleteButton);
    card.append(info, actions);
    dom.libraryList.append(card);
  });
}

async function selectLibraryMovie(item) {
  if (!state.isHost || !state.roomId) {
    return;
  }

  if (state.librarySelectingItemId) {
    showToast("جاري تجهيز الفيديو...");
    return;
  }

  const mode = state.pendingUploadMode === "queue" || shouldQueueNextUpload() ? "queue" : "replace";
  state.pendingUploadMode = "";
  state.librarySelectingItemId = item.id;
  setLibraryUploadProgress(8, item.name || "فيديو من المكتبة", "جاري تجهيز الفيديو من المكتبة");
  renderLibraryItems();
  showToast("جاري تجهيز الفيديو من المكتبة...");

  try {
    await prepareLibraryMovie(item, { mode });
  } catch (error) {
    console.error(error);
    showToast(getFriendlyErrorMessage(error));
  } finally {
    state.librarySelectingItemId = "";
    if (state.screen === "library") {
      renderLibraryItems();
    }
  }
}

async function prepareLibraryMovie(item, options = {}) {
  const film = buildFilmFromLibraryItem(item);
  const mode = options.mode === "queue" ? "queue" : "replace";

  if (mode === "queue") {
    setLibraryUploadProgress(45, item.name || "فيديو من المكتبة", "إضافة الفيلم التالي");
    await publishQueuedMovieState(film);
    setLibraryUploadProgress(100, item.name || "فيديو من المكتبة", "جاهز");
    state.librarySelectMode = false;
    switchScreen("room");
    updateModeUi();
    revealHostControls();
    showToast("تم تجهيز فيديو المكتبة كالفيلم التالي.");
    return;
  }

  cleanupViewerReconnect();
  resetHostMovieState();
  closeAllPeers();

  setLibraryUploadProgress(35, item.name || "فيديو من المكتبة", "تحميل أول لقطة");
  await loadHostStorageMovie(film);
  setLibraryUploadProgress(78, item.name || "فيديو من المكتبة", "نشر الفيلم في الغرفة");
  await publishStorageMovieState(film);
  setLibraryUploadProgress(100, item.name || "فيديو من المكتبة", "جاهز");

  state.librarySelectMode = false;
  switchScreen("room");
  updateModeUi();
  updateHostPlaybackUi();
  updateWaitingOverlay();
  revealHostControls();
  await flushPendingViewers();
  showToast("تم اختيار الفيديو من المكتبة.");
}

function buildFilmFromLibraryItem(item) {
  return {
    source: "storage",
    storageOwner: "library",
    libraryItemId: item.id,
    name: item.name || "فيديو من المكتبة",
    size: Number(item.size || 0),
    duration: roundTime(Number(item.duration || 0)),
    storagePath: item.storagePath || "",
    url: item.url || "",
    contentType: item.contentType || "video/mp4",
    preparedAt: Date.now(),
  };
}

function openLibraryRenameModal(item) {
  state.libraryRenameItemId = item.id;
  dom.libraryRenameInput.value = item.name || "";
  dom.libraryRenameModal.classList.remove("hidden");
  window.setTimeout(() => dom.libraryRenameInput.focus(), 0);
}

function closeLibraryRenameModal() {
  dom.libraryRenameModal.classList.add("hidden");
  state.libraryRenameItemId = "";
}

async function handleLibraryRenameSubmit(event) {
  event.preventDefault();
  const itemId = state.libraryRenameItemId;
  const name = sanitizeLibraryName(dom.libraryRenameInput.value);
  if (!itemId || !name) {
    showToast("اكتب اسم الفيديو.");
    return;
  }

  try {
    await update(ref(db, `library/${itemId}`), {
      name,
      updatedAt: Date.now(),
    });
    closeLibraryRenameModal();
    showToast("تم تعديل الاسم.");
    await loadLibraryItems();
  } catch (error) {
    console.error(error);
    showToast(getFriendlyErrorMessage(error));
  }
}

async function deleteLibraryItem(item) {
  const approved = await askForConfirmation(
    "حذف الفيديو",
    "سيتم حذف الفيديو من المكتبة والستورج مباشرة. هل تريد المتابعة؟"
  );
  if (!approved) {
    return;
  }

  try {
    await deleteStorageFile(item.storagePath).catch((error) => {
      if (error?.code !== "storage/object-not-found") {
        throw error;
      }
    });
    await remove(ref(db, `library/${item.id}`));
    showToast("تم حذف الفيديو من المكتبة.");
    await loadLibraryItems();
  } catch (error) {
    console.error(error);
    showToast(getFriendlyErrorMessage(error));
  }
}

async function handleYoutubeSubmit(event) {
  event.preventDefault();
  if (!state.isHost) {
    return;
  }

  state.pendingUploadMode = "";
  const value = dom.youtubeUrlInput.value.trim();
  const youtubeId = extractYoutubeId(value);
  if (!youtubeId) {
    await searchYoutube(value).catch((error) => {
      if (error.name === "AbortError") {
        return;
      }
      console.error("youtube search error", error);
      renderYoutubeSearchMessage("تعذر البحث في يوتيوب.");
    });
    showToast("اختر نتيجة من البحث.");
    return;
  }

  try {
    await prepareYoutubeMovie(buildYoutubeWatchUrl(youtubeId), youtubeId);
  } catch (error) {
    console.error(error);
    showToast(getFriendlyErrorMessage(error));
  }
}

async function searchYoutube(query) {
  const text = (query || "").trim();
  if (!text || extractYoutubeId(text)) {
    clearYoutubeSearchResults();
    return;
  }

  state.youtubeSearchAbortController?.abort();
  const requestId = state.youtubeSearchRequestId + 1;
  state.youtubeSearchRequestId = requestId;
  state.youtubeSearchAbortController = new AbortController();
  state.youtubeSearchQuery = text;
  state.youtubeSearchNextPageToken = "";
  state.youtubeSearchHasMore = false;
  state.youtubeSearchLoading = true;
  state.youtubeSearchVideoIds = new Set();
  renderYoutubeSearchMessage("جاري البحث...");

  try {
    const data = await fetchYoutubeSearchPage(text, "", state.youtubeSearchAbortController.signal);

    if (requestId !== state.youtubeSearchRequestId) {
      return;
    }

    const results = await hydrateYoutubeResults(data.items || [], state.youtubeSearchAbortController.signal);

    if (requestId !== state.youtubeSearchRequestId) {
      return;
    }

    state.youtubeSearchNextPageToken = data.nextPageToken || "";
    state.youtubeSearchHasMore = Boolean(state.youtubeSearchNextPageToken);
    renderYoutubeSearchResults(results);
  } finally {
    if (requestId === state.youtubeSearchRequestId) {
      state.youtubeSearchLoading = false;
      state.youtubeSearchAbortController = null;
      removeYoutubeSearchLoading();
    }
  }
}

async function loadMoreYoutubeResults() {
  const text = state.youtubeSearchQuery;
  if (
    !text ||
    state.youtubeSearchLoading ||
    !state.youtubeSearchHasMore ||
    !state.youtubeSearchNextPageToken
  ) {
    return;
  }

  const requestId = state.youtubeSearchRequestId;
  const pageToken = state.youtubeSearchNextPageToken;
  const controller = new AbortController();
  state.youtubeSearchAbortController = controller;
  state.youtubeSearchLoading = true;
  appendYoutubeSearchLoading();

  try {
    const data = await fetchYoutubeSearchPage(text, pageToken, controller.signal);

    if (requestId !== state.youtubeSearchRequestId || text !== state.youtubeSearchQuery) {
      return;
    }

    const results = await hydrateYoutubeResults(data.items || [], controller.signal);

    if (requestId !== state.youtubeSearchRequestId || text !== state.youtubeSearchQuery) {
      return;
    }

    state.youtubeSearchNextPageToken = data.nextPageToken || "";
    state.youtubeSearchHasMore = Boolean(state.youtubeSearchNextPageToken);
    renderYoutubeSearchResults(results, { append: true });
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("youtube load more error", error);
      state.youtubeSearchHasMore = false;
      appendYoutubeSearchMessage("تعذر تحميل المزيد.");
    }
  } finally {
    if (requestId === state.youtubeSearchRequestId && text === state.youtubeSearchQuery) {
      state.youtubeSearchLoading = false;
      state.youtubeSearchAbortController = null;
      removeYoutubeSearchLoading();
    }
  }
}

async function fetchYoutubeSearchPage(query, pageToken = "", signal) {
  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    videoEmbeddable: "true",
    maxResults: "8",
    q: query,
    key: YOUTUBE_SEARCH_API_KEY,
  });
  if (pageToken) {
    params.set("pageToken", pageToken);
  }

  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error("تعذر البحث في يوتيوب.");
  }

  return response.json();
}

async function hydrateYoutubeResults(items, signal) {
  const results = items
    .map((item) => ({
      videoId: item.id?.videoId || "",
      title: item.snippet?.title || "YouTube",
      channelTitle: item.snippet?.channelTitle || "",
      thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || "",
    }))
    .filter((item) => item.videoId && !state.youtubeSearchVideoIds.has(item.videoId));

  if (!results.length) {
    return [];
  }

  const durations = await fetchYoutubeDurations(
    results.map((item) => item.videoId),
    signal
  ).catch((error) => {
    if (error.name !== "AbortError") {
      console.warn("youtube durations error", error);
    }
    return new Map();
  });

  results.forEach((result) => {
    state.youtubeSearchVideoIds.add(result.videoId);
    result.duration = durations.get(result.videoId) || "";
  });

  return results;
}

async function fetchYoutubeDurations(videoIds, signal) {
  if (!videoIds.length) {
    return new Map();
  }

  const params = new URLSearchParams({
    part: "contentDetails",
    id: videoIds.join(","),
    key: YOUTUBE_SEARCH_API_KEY,
  });

  const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`, { signal });
  if (!response.ok) {
    throw new Error("تعذر جلب مدة الفيديو.");
  }

  const data = await response.json();
  return new Map(
    (data.items || []).map((item) => [
      item.id,
      formatYoutubeDuration(item.contentDetails?.duration || ""),
    ])
  );
}

function renderYoutubeSearchResults(results, options = {}) {
  const append = Boolean(options.append);
  removeYoutubeSearchLoading();
  if (!append) {
    dom.youtubeSearchResults.innerHTML = "";
  }

  if (!results.length) {
    if (!append) {
      renderYoutubeSearchMessage("لا توجد نتائج.");
    }
    return;
  }

  results.forEach((result) => {
    const button = document.createElement("button");
    button.className = "youtube-result-item";
    button.type = "button";
    button.addEventListener("click", () => selectYoutubeResult(result));

    const thumbWrap = document.createElement("div");
    thumbWrap.className = "youtube-result-thumb-wrap";

    const image = document.createElement("img");
    image.className = "youtube-result-thumb";
    image.src = result.thumbnail;
    image.alt = "";

    thumbWrap.append(image);

    if (result.duration) {
      const duration = document.createElement("span");
      duration.className = "youtube-result-duration";
      duration.textContent = result.duration;
      thumbWrap.append(duration);
    }

    const textWrap = document.createElement("div");
    textWrap.className = "youtube-result-text";

    const title = document.createElement("div");
    title.className = "youtube-result-title";
    title.textContent = result.title;

    const channel = document.createElement("div");
    channel.className = "youtube-result-channel";
    channel.textContent = result.channelTitle;

    textWrap.append(title, channel);
    button.append(thumbWrap, textWrap);
    dom.youtubeSearchResults.append(button);
  });

  dom.youtubeSearchResults.classList.remove("hidden");
}

function renderYoutubeSearchMessage(message) {
  dom.youtubeSearchResults.innerHTML = "";
  if (!message) {
    dom.youtubeSearchResults.classList.add("hidden");
    return;
  }

  const item = document.createElement("div");
  item.className = "youtube-search-message";
  item.textContent = message;
  dom.youtubeSearchResults.append(item);
  dom.youtubeSearchResults.classList.remove("hidden");
}

function appendYoutubeSearchMessage(message) {
  removeYoutubeSearchLoading();
  if (!message) {
    return;
  }
  const item = document.createElement("div");
  item.className = "youtube-search-message";
  item.textContent = message;
  dom.youtubeSearchResults.append(item);
  dom.youtubeSearchResults.classList.remove("hidden");
}

function appendYoutubeSearchLoading() {
  removeYoutubeSearchLoading();
  const item = document.createElement("div");
  item.className = "youtube-search-message youtube-search-loader";
  item.textContent = "جاري تحميل المزيد...";
  dom.youtubeSearchResults.append(item);
  dom.youtubeSearchResults.classList.remove("hidden");
}

function removeYoutubeSearchLoading() {
  dom.youtubeSearchResults.querySelector(".youtube-search-loader")?.remove();
}

function clearYoutubeSearchResults() {
  clearTimeout(state.youtubeSearchTimer);
  state.youtubeSearchAbortController?.abort();
  state.youtubeSearchAbortController = null;
  state.youtubeSearchQuery = "";
  state.youtubeSearchNextPageToken = "";
  state.youtubeSearchLoading = false;
  state.youtubeSearchHasMore = false;
  state.youtubeSearchVideoIds = new Set();
  dom.youtubeSearchResults.innerHTML = "";
  dom.youtubeSearchResults.classList.add("hidden");
}

function handleYoutubeResultsScroll() {
  const { scrollTop, scrollHeight, clientHeight } = dom.youtubeSearchResults;
  if (scrollHeight - (scrollTop + clientHeight) < 90) {
    loadMoreYoutubeResults();
  }
}

async function selectYoutubeResult(result) {
  dom.youtubeUrlInput.value = result.title;
  state.pendingUploadMode = "";
  clearYoutubeSearchResults();
  try {
    await prepareYoutubeMovie(buildYoutubeWatchUrl(result.videoId), result.videoId);
  } catch (error) {
    console.error(error);
    showToast(getFriendlyErrorMessage(error));
  }
}

async function prepareHostMovie(file, options = {}) {
  if (!file.type.startsWith("video/") && !/\.(mkv|mp4|mov|webm)$/i.test(file.name)) {
    throw new Error("اختر ملف فيديو صالحاً.");
  }

  const mode = options.mode === "queue" ? "queue" : "replace";
  const startedAt = performance.now();
  setUploadProgress(2, file.name, mode === "queue" ? "رفع الفيلم التالي" : "بدء الرفع");

  if (mode === "queue") {
    const queuedFilm = await uploadMovieToStorage(file, {
      slot: "next",
      startedAt,
      statusPrefix: "رفع الفيلم التالي",
    });
    await publishQueuedMovieState(queuedFilm);
    setUploadProgress(100, file.name, "تم تجهيز الفيلم التالي");
    switchScreen("room");
    updateModeUi();
    revealHostControls();
    showToast("تم تجهيز الفيلم التالي وسيبدأ بعد انتهاء الحالي.");
    return;
  }

  cleanupViewerReconnect();
  resetHostMovieState();
  closeAllPeers();

  const film = await uploadMovieToStorage(file, {
    slot: "current",
    startedAt,
    statusPrefix: "رفع الفيلم",
  });

  await loadHostStorageMovie(film);
  await publishStorageMovieState(film);

  updateModeUi();
  setUploadProgress(100, file.name, "جاهز");
  switchScreen("room");
  updateModeUi();
  updateHostPlaybackUi();
  updateWaitingOverlay();
  revealHostControls();
  await flushPendingViewers();
  showToast("تم تجهيز الفيلم بنجاح.");
}

async function prepareYoutubeMovie(url, youtubeId) {
  cleanupViewerReconnect();
  resetHostMovieState();
  closeAllPeers();
  clearYoutubeSearchResults();

  setUploadProgress(30, "YouTube", "تجهيز الرابط");

  state.hostMedia = {
    source: "youtube",
    file: null,
    fileUrl: "",
    name: "YouTube",
    size: 0,
    duration: 0,
    youtubeId,
    youtubeUrl: url,
  };
  state.localPrepared = false;

  const player = await ensureYoutubePlayer(youtubeId);
  setUploadProgress(72, "YouTube", "تجهيز المشغل");
  await wait(450);

  const videoData = typeof player.getVideoData === "function" ? player.getVideoData() : null;
  state.hostMedia.name = videoData?.title || "YouTube";
  state.hostMedia.duration = getYoutubeDuration();
  state.localPrepared = true;

  await publishYoutubeMovieState();
  updateModeUi();
  setUploadProgress(100, state.hostMedia.name, "جاهز");
  dom.youtubeUrlInput.value = "";
  switchScreen("room");
  updateModeUi();
  updateHostPlaybackUi();
  updateWaitingOverlay();
  revealHostControls();
  await flushPendingViewers();
  showToast("تم تجهيز رابط يوتيوب.");
}

async function uploadMovieToStorage(file, options = {}) {
  const slot = options.slot || "current";
  const startedAt = options.startedAt || performance.now();
  const statusPrefix = options.statusPrefix || "رفع الفيلم";
  const safeName = sanitizeStorageFileName(file.name || "movie.mp4");
  const path = `rooms/${state.roomId}/${slot}-${Date.now()}-${safeName}`;
  const fileRef = storageRef(storage, path);
  const metadata = {
    contentType: file.type || "video/mp4",
    cacheControl: "private,max-age=3600",
    customMetadata: {
      roomId: state.roomId,
      slot,
      originalName: file.name || "movie",
    },
  };

  const metadataPromise = readLocalVideoMetadata(file);
  const uploadTask = uploadBytesResumable(fileRef, file, metadata);

  const snapshot = await new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (uploadSnapshot) => {
        const percent = uploadSnapshot.totalBytes
          ? (uploadSnapshot.bytesTransferred / uploadSnapshot.totalBytes) * 100
          : 0;
        const elapsed = Math.max((performance.now() - startedAt) / 1000, 0.25);
        const speed = uploadSnapshot.bytesTransferred / elapsed;
        setUploadProgress(
          Math.max(2, Math.min(percent, 99)),
          file.name,
          `${statusPrefix} ${formatBytes(uploadSnapshot.bytesTransferred)} / ${formatBytes(uploadSnapshot.totalBytes)} · ${formatBytes(speed)}/ث`
        );
      },
      reject,
      () => resolve(uploadTask.snapshot)
    );
  });

  const [localMetadata, url] = await Promise.all([
    metadataPromise,
    getDownloadURL(snapshot.ref),
  ]);

  return {
    source: "storage",
    name: file.name || "movie",
    size: file.size || 0,
    duration: roundTime(localMetadata.duration || 0),
    storagePath: path,
    url,
    contentType: file.type || "video/mp4",
    preparedAt: Date.now(),
  };
}

async function readLocalVideoMetadata(file) {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "metadata";
  video.muted = true;
  video.playsInline = true;
  video.src = objectUrl;

  try {
    await waitForVideoReady(video, "loadedmetadata");
    return {
      duration: Number.isFinite(video.duration) ? video.duration : 0,
      width: video.videoWidth || 0,
      height: video.videoHeight || 0,
    };
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}

async function loadHostStorageMovie(film) {
  cleanupYouTubePlayer();
  releaseHostWakeLock();
  state.hostCaptureStream?.getTracks().forEach((track) => track.stop());
  state.hostCaptureStream = null;
  state.hostVideoTrack = null;
  state.localPrepared = false;
  state.hostMedia = createHostMediaFromStorageFilm(film);
  state.lastStorageMediaPath = film.storagePath || "";

  dom.hostVideo.pause();
  dom.hostVideo.src = await getStorageFilmUrl(film);
  dom.hostVideo.load();
  await waitForVideoReady(dom.hostVideo, "loadedmetadata");
  state.hostMedia.duration = Number.isFinite(dom.hostVideo.duration)
    ? dom.hostVideo.duration
    : film.duration || 0;
  await waitForPlayable(dom.hostVideo);
  state.localPrepared = true;
}

function createHostMediaFromStorageFilm(film) {
  return {
    source: "storage",
    file: null,
    fileUrl: "",
    name: film.name || "الفيلم",
    size: film.size || 0,
    duration: film.duration || 0,
    youtubeId: "",
    youtubeUrl: "",
    storagePath: film.storagePath || "",
    url: film.url || "",
    contentType: film.contentType || "video/mp4",
  };
}

async function getStorageFilmUrl(film) {
  if (film?.url) {
    return film.url;
  }
  if (!film?.storagePath) {
    throw new Error("تعذر العثور على رابط الفيلم.");
  }
  return getDownloadURL(storageRef(storage, film.storagePath));
}

async function publishStorageMovieState(film) {
  const now = Date.now();
  const previousPath = getDeletableStoragePath(state.roomData?.film);
  const previousQueuedPath = getDeletableStoragePath(state.roomData?.nextFilm);
  const payload = {
    status: "live",
    lastActivity: now,
    film,
    nextFilm: null,
    sync: {
      currentTime: 0,
      duration: roundTime(film.duration || 0),
      isPlaying: false,
      isBuffering: false,
      updatedAt: now,
    },
  };

  await update(ref(db, `rooms/${state.roomId}`), payload);
  state.roomData = {
    ...(state.roomData || {}),
    ...payload,
  };
  await touchRoomIndex(state.roomId, now).catch((error) => console.warn("activity index failed", error));

  if (previousPath && previousPath !== film.storagePath) {
    deleteStorageFile(previousPath).catch((error) => console.warn("old storage delete failed", error));
  }
  if (previousQueuedPath && previousQueuedPath !== film.storagePath) {
    deleteStorageFile(previousQueuedPath).catch((error) => console.warn("old queued delete failed", error));
  }
}

async function publishQueuedMovieState(film) {
  const previousQueuedPath = getDeletableStoragePath(state.roomData?.nextFilm);
  await update(ref(db, `rooms/${state.roomId}`), {
    nextFilm: film,
  });
  state.roomData = {
    ...(state.roomData || {}),
    nextFilm: film,
  };

  if (previousQueuedPath && previousQueuedPath !== film.storagePath) {
    deleteStorageFile(previousQueuedPath).catch((error) => console.warn("old queued delete failed", error));
  }
}

async function playQueuedFilmIfReady() {
  if (!state.isHost || !state.roomId) {
    return;
  }

  const nextFilm = state.roomData?.nextFilm;
  if (!nextFilm?.storagePath) {
    return;
  }

  const previousPath = getDeletableStoragePath(state.roomData?.film);
  await loadHostStorageMovie(nextFilm);
  await prepareHostMovieAudio();
  const started = await dom.hostVideo.play().then(
    () => true,
    () => false
  );

  const now = Date.now();
  const payload = {
    status: "live",
    lastActivity: now,
    film: {
      ...nextFilm,
      preparedAt: nextFilm.preparedAt || now,
    },
    nextFilm: null,
    sync: {
      currentTime: 0,
      duration: roundTime(nextFilm.duration || state.hostMedia.duration || 0),
      isPlaying: started,
      isBuffering: false,
      updatedAt: now,
    },
  };

  await update(ref(db, `rooms/${state.roomId}`), payload);
  state.roomData = {
    ...(state.roomData || {}),
    ...payload,
  };
  await touchRoomIndex(state.roomId, now).catch((error) => console.warn("activity index failed", error));

  if (previousPath && previousPath !== nextFilm.storagePath) {
    deleteStorageFile(previousPath).catch((error) => console.warn("previous storage delete failed", error));
  }

  updateHostPlaybackUi();
  updateWaitingOverlay();
  revealHostControls();
  showToast(started ? "بدأ الفيلم التالي." : "الفيلم التالي جاهز للتشغيل.");
}

async function deleteStorageFile(path) {
  if (!path) {
    return;
  }
  await deleteObject(storageRef(storage, path));
}

function isLibraryStorageFilm(film) {
  return Boolean(
    film?.source === "storage" &&
      (film.storageOwner === "library" || film.libraryItemId || String(film.storagePath || "").startsWith("library/"))
  );
}

function getDeletableStoragePath(film) {
  if (!film?.storagePath || isLibraryStorageFilm(film)) {
    return "";
  }
  return film.storagePath;
}

function setUploadProgress(percent, fileName, speedLabel) {
  state.uploadProgress = percent;
  dom.uploadStatusCard.classList.remove("hidden");
  dom.uploadFileName.textContent = fileName;
  dom.uploadProgressLabel.textContent = `${Math.round(percent)}%`;
  dom.uploadSpeedLabel.textContent = speedLabel;
  dom.uploadProgressBar.style.width = `${percent}%`;
  if (dom.uploadHint) {
    dom.uploadHint.textContent = "";
  }
}

function resetLibraryUploadProgress() {
  dom.libraryUploadStatusCard.classList.add("hidden");
  dom.libraryUploadFileName.textContent = "جارٍ التحضير...";
  dom.libraryUploadProgressLabel.textContent = "0%";
  dom.libraryUploadSpeedLabel.textContent = "";
  dom.libraryUploadProgressBar.style.width = "0%";
}

function setLibraryUploadProgress(percent, fileName, speedLabel) {
  dom.libraryUploadStatusCard.classList.remove("hidden");
  dom.libraryUploadFileName.textContent = fileName;
  dom.libraryUploadProgressLabel.textContent = `${Math.round(percent)}%`;
  dom.libraryUploadSpeedLabel.textContent = speedLabel;
  dom.libraryUploadProgressBar.style.width = `${percent}%`;
}

async function restorePersistedHostMovie(roomId) {
  const persisted = await getPersistedHostMovie(roomId);
  if (!persisted?.blob) {
    return false;
  }

  const blob = persisted.blob;
  const file =
    blob instanceof File
      ? blob
      : new File([blob], persisted.name || "movie", {
          type: persisted.type || "video/mp4",
        });

  resetHostMovieState();
  state.hostMedia.source = "file";
  state.hostMedia.file = file;
  state.hostMedia.fileUrl = URL.createObjectURL(file);
  state.hostMedia.name = persisted.name || file.name || "movie";
  state.hostMedia.size = persisted.size || file.size || 0;
  state.hostMedia.duration = 0;
  state.localPrepared = false;

  dom.hostVideo.src = state.hostMedia.fileUrl;
  dom.hostVideo.load();

  await waitForVideoReady(dom.hostVideo, "loadedmetadata");
  state.hostMedia.duration = Number.isFinite(dom.hostVideo.duration) ? dom.hostVideo.duration : 0;
  await waitForPlayable(dom.hostVideo);
  await primeHostVideo();
  state.localPrepared = true;
  return true;
}

async function resumeRestoredHostPlayback() {
  if (!state.isHost || !state.localPrepared) {
    return;
  }

  switchScreen("room");
  updateModeUi();

  const targetTime = Math.max(
    0,
    Math.min(
      state.roomData?.sync?.currentTime || 0,
      Math.max((state.hostMedia.duration || dom.hostVideo.duration || 0) - 0.25, 0)
    )
  );

  if (targetTime > 0) {
    dom.hostVideo.currentTime = targetTime;
    await wait(120);
  }

  if (state.roomData?.sync?.isPlaying) {
    await prepareHostMovieAudio();
    await dom.hostVideo.play().catch(() => {});
  } else {
    dom.hostVideo.pause();
  }

  updateHostPlaybackUi();
  await syncHostPlayback(true);
  updateWaitingOverlay();
  await flushPendingViewers();
}

function resetHostMovieState() {
  if (state.hostMedia.fileUrl) {
    URL.revokeObjectURL(state.hostMedia.fileUrl);
  }

  disconnectMovieSource();
  stopHostVideoRenderLoop();
  releaseHostWakeLock();
  cleanupYouTubePlayer();

  if (state.hostCaptureStream) {
    state.hostCaptureStream.getTracks().forEach((track) => track.stop());
  }

  state.hostCaptureStream = null;
  state.hostVideoTrack = null;
  state.localPrepared = false;
  setLocalBuffering(false);
  state.hostMedia = {
    source: "",
    file: null,
    fileUrl: "",
    name: "",
    size: 0,
    duration: 0,
    youtubeId: "",
    youtubeUrl: "",
    storagePath: "",
    url: "",
    contentType: "",
  };
  state.lastStorageMediaPath = "";

  hideHostControls();
  dom.hostVideo.pause();
  dom.hostVideo.removeAttribute("src");
  dom.hostVideo.load();
}

async function primeHostVideo() {
  const videoCaptureMethod = dom.hostVideo.captureStream || dom.hostVideo.mozCaptureStream;
  const canvasCaptureMethod = dom.hostBroadcastCanvas.captureStream || dom.hostBroadcastCanvas.mozCaptureStream;
  if (!videoCaptureMethod && !canvasCaptureMethod) {
    throw new Error("هذا المتصفح لا يدعم البث على هذا الجهاز.");
  }

  await ensureHostAudioContext();
  connectMovieAudioSource();
  dom.hostVideo.muted = true;
  dom.hostVideo.volume = 1;
  await dom.hostVideo.play().catch(() => {});
  await wait(140);
  dom.hostVideo.pause();
  dom.hostVideo.currentTime = 0;
  dom.hostVideo.muted = false;

  if (videoCaptureMethod) {
    try {
      state.hostCaptureStream = videoCaptureMethod.call(dom.hostVideo);
      state.hostVideoTrack = state.hostCaptureStream.getVideoTracks()[0] || null;
    } catch (error) {
      console.warn("video captureStream failed, falling back to canvas", error);
      state.hostCaptureStream = null;
      state.hostVideoTrack = null;
    }
  }

  if (!state.hostVideoTrack && canvasCaptureMethod) {
    if (state.hostCaptureStream) {
      state.hostCaptureStream.getTracks().forEach((track) => track.stop());
      state.hostCaptureStream = null;
    }
    resizeHostBroadcastCanvas();
    startHostVideoRenderLoop();
    state.hostCaptureStream = canvasCaptureMethod.call(dom.hostBroadcastCanvas, 30);
  }

  state.hostVideoTrack = state.hostCaptureStream?.getVideoTracks()[0] || null;
  if (state.hostVideoTrack && "contentHint" in state.hostVideoTrack) {
    state.hostVideoTrack.contentHint = "motion";
  }

  if (!state.hostVideoTrack) {
    throw new Error("تعذر تجهيز مسار الفيديو للبث.");
  }
}

function disconnectMovieSource() {
  if (state.movieSourceNode) {
    try {
      state.movieSourceNode.disconnect();
    } catch (error) {
      console.warn(error);
    }
  }
  state.viewerMixes.forEach((mix) => {
    mix.movieAttached = false;
  });
  state.movieMonitorConnected = false;
}

function connectMovieAudioSource() {
  if (!state.hostAudioContext) {
    return;
  }

  disconnectMovieSource();
  if (!state.movieSourceNode) {
    state.movieSourceNode = state.hostAudioContext.createMediaElementSource(dom.hostVideo);
  }
  state.movieSourceNode.connect(state.hostAudioContext.destination);
  state.movieMonitorConnected = true;
  state.viewerMixes.forEach((mix) => attachMovieSourceToMix(mix));
}

async function prepareHostMovieAudio() {
  if (!state.isHost || !state.localPrepared) {
    return;
  }

  if (isStorageMode()) {
    dom.hostVideo.muted = false;
    dom.hostVideo.volume = 1;
    return;
  }

  await ensureHostAudioContext();
  connectMovieAudioSource();
  dom.hostVideo.muted = false;
  dom.hostVideo.volume = 1;
}

function resizeHostBroadcastCanvas() {
  const width = Math.max(1, dom.hostVideo.videoWidth || 1280);
  const height = Math.max(1, dom.hostVideo.videoHeight || 720);
  if (dom.hostBroadcastCanvas.width !== width || dom.hostBroadcastCanvas.height !== height) {
    dom.hostBroadcastCanvas.width = width;
    dom.hostBroadcastCanvas.height = height;
  }
}

function startHostVideoRenderLoop() {
  stopHostVideoRenderLoop();
  const context = dom.hostBroadcastCanvas.getContext("2d", { alpha: false, desynchronized: true });
  if (!context) {
    throw new Error("تعذر تجهيز البث على هذا الجهاز.");
  }

  const draw = () => {
    resizeHostBroadcastCanvas();
    if (dom.hostVideo.readyState >= 2 && dom.hostVideo.videoWidth > 0) {
      context.drawImage(
        dom.hostVideo,
        0,
        0,
        dom.hostBroadcastCanvas.width,
        dom.hostBroadcastCanvas.height
      );
    } else {
      context.clearRect(0, 0, dom.hostBroadcastCanvas.width, dom.hostBroadcastCanvas.height);
    }
    state.hostVideoRenderLoop = requestAnimationFrame(draw);
  };

  draw();
}

function stopHostVideoRenderLoop() {
  if (state.hostVideoRenderLoop) {
    cancelAnimationFrame(state.hostVideoRenderLoop);
    state.hostVideoRenderLoop = null;
  }
}

async function ensureHostAudioContext() {
  if (!state.hostAudioContext) {
    state.hostAudioContext = new AudioContext();
  }
  if (state.hostAudioContext.state === "suspended") {
    await state.hostAudioContext.resume().catch(() => {});
  }
  return state.hostAudioContext;
}

async function requestHostWakeLock() {
  if (!state.isHost || !state.localPrepared || state.wakeLock || !navigator.wakeLock?.request) {
    return;
  }

  try {
    state.wakeLock = await navigator.wakeLock.request("screen");
    state.wakeLock.addEventListener("release", () => {
      state.wakeLock = null;
    });
  } catch (error) {
    console.warn("wake lock unavailable", error);
  }
}

async function releaseHostWakeLock() {
  if (!state.wakeLock) {
    return;
  }

  const lock = state.wakeLock;
  state.wakeLock = null;
  await lock.release().catch(() => {});
}

function handleVisibilityChange() {
  const playing = isYoutubeMode() ? isYoutubePlaying() : !dom.hostVideo.paused && !dom.hostVideo.ended;
  if (!state.isHost || !state.localPrepared || !playing) {
    return;
  }

  if (document.visibilityState === "visible") {
    requestHostWakeLock();
    return;
  }

  const now = Date.now();
  if (now - state.lastVisibilityToastAt > 9000) {
    state.lastVisibilityToastAt = now;
    showToast("ابق صفحة الغرفة مفتوحة حتى يستمر البث بسلاسة.");
  }
}

function getActiveFilm() {
  if (state.hostMedia.source) {
    return state.hostMedia;
  }
  return state.roomData?.film || null;
}

function isYoutubeMode() {
  return getActiveFilm()?.source === "youtube";
}

function isStorageMode() {
  return getActiveFilm()?.source === "storage";
}

async function handleRoomMediaUpdate() {
  const film = state.roomData?.film;
  if (film?.source === "storage") {
    await handleStorageMediaUpdate(film);
    return;
  }

  if (film?.source !== "youtube") {
    if (!state.isHost || state.hostMedia.source !== "youtube") {
      cleanupYouTubePlayer();
    }
    return;
  }

  if (state.isHost && state.hostMedia.source === "file") {
    return;
  }

  await ensureYoutubePlayer(film.youtubeId);

  const shouldRestoreHost = state.isHost && (!state.localPrepared || state.hostMedia.youtubeId !== film.youtubeId);
  if (shouldRestoreHost) {
    state.hostMedia = {
      source: "youtube",
      file: null,
      fileUrl: "",
      name: film.name || "YouTube",
      size: 0,
      duration: film.duration || 0,
      youtubeId: film.youtubeId,
      youtubeUrl: film.url || "",
    };
    state.localPrepared = true;
    await applyYoutubeSync(state.roomData.sync, true, true);
    await flushPendingViewers();
  }

  if (!state.isHost) {
    await applyYoutubeSync(state.roomData.sync);
    scheduleViewerReconnect(350);
  }

  updateModeUi();
  updateHostPlaybackUi();
  updateWaitingOverlay();
}

async function handleStorageMediaUpdate(film) {
  cleanupYouTubePlayer();

  if (state.isHost) {
    const shouldLoadHost =
      !state.localPrepared ||
      state.hostMedia.source !== "storage" ||
      state.hostMedia.storagePath !== film.storagePath;

    if (shouldLoadHost) {
      await loadHostStorageMovie(film);
      await applyStorageSync(state.roomData?.sync, true, true);
    }
  } else {
    const loadedNewMovie = await loadViewerStorageMovie(film);
    const sync = state.roomData?.sync;
    if (isViewerJoinGateActive() && sync?.isBuffering) {
      clearViewerJoinGate();
      await applyStorageSync(sync);
    } else if (shouldStartViewerJoinGate(loadedNewMovie, sync)) {
      await startViewerJoinGate(sync);
    } else if (!isViewerJoinGateActive()) {
      await applyStorageSync(sync);
    }
    scheduleViewerReconnect(350);
  }

  updateModeUi();
  updateHostPlaybackUi();
  updateWaitingOverlay();
}

async function loadViewerStorageMovie(film) {
  if (dom.remoteVideo.dataset.storagePath === film.storagePath && dom.remoteVideo.src) {
    return false;
  }

  const url = await getStorageFilmUrl(film);
  if (dom.remoteVideo.dataset.storagePath === film.storagePath && dom.remoteVideo.src === url) {
    return false;
  }

  clearViewerJoinGate();
  setLocalBuffering(true);
  state.viewerInitialLoadActive = true;
  state.viewerStorageInitialSynced = false;
  clearViewerBufferingTimer();
  cleanupViewerReconnect();
  closeAllPeers();
  stopViewerCanvasLoop();
  state.viewerRemoteStream = null;
  clearViewerPausedPreparation();
  dom.remoteAudio.pause();
  dom.remoteAudio.srcObject = null;
  dom.remoteVideo.pause();
  dom.remoteVideo.srcObject = null;
  dom.remoteVideo.muted = false;
  resetViewerPlaybackRate();
  dom.remoteVideo.dataset.storagePath = film.storagePath || "";
  dom.remoteVideo.src = url;
  dom.remoteVideo.load();
  return true;
}

async function applyStorageSync(sync = null, force = false, allowHost = false) {
  if (!sync || (state.isHost && !allowHost)) {
    return;
  }

  if (!state.isHost && isViewerJoinGateActive()) {
    return;
  }

  if (!state.isHost && state.viewerStorageSyncing) {
    return;
  }

  if (!state.isHost) {
    state.viewerStorageSyncing = true;
  }

  try {
    await applyStorageSyncNow(sync, force);
  } finally {
    if (!state.isHost) {
      state.viewerStorageSyncing = false;
    }
  }
}

async function applyStorageSyncNow(sync = null, force = false) {
  const video = state.isHost ? dom.hostVideo : dom.remoteVideo;
  if (!video.src && !video.srcObject) {
    return;
  }

  if (video.readyState === 0) {
    await waitForVideoReady(video, "loadedmetadata").catch(() => {});
  }

  const duration = Number.isFinite(video.duration) ? video.duration : sync.duration || 0;
  const targetTime = getProjectedSyncTime(sync, duration);
  const currentTime = video.currentTime || 0;
  const isViewerStorage = !state.isHost && isStorageMode();
  const isInitialViewerSync = isViewerStorage && !state.viewerStorageInitialSynced;
  const seekTolerance = state.isHost ? 1.25 : isInitialViewerSync || force ? 1.25 : 8;
  const shouldSeek = force || Math.abs(currentTime - targetTime) > seekTolerance;

  if (isViewerStorage && shouldSeek) {
    setLocalBuffering(true);
    video.pause();
    video.currentTime = targetTime;
    await Promise.race([waitForSeekCompletion(video), wait(3500)]).catch(() => {});
    await Promise.race([waitForPlayable(video), wait(4500)]).catch(() => {});
  } else if (shouldSeek) {
    if (!state.isHost) {
      setLocalBuffering(true);
    }
    video.currentTime = targetTime;
  }

  if (sync.isBuffering && sync.isPlaying) {
    video.pause();
    dom.playUnlockOverlay.classList.add("hidden");
    renderViewerTime({
      currentTime: targetTime,
      duration,
    });
    updateBufferingOverlay();
    return;
  }

  if (sync.isPlaying) {
    if (isViewerStorage && video.paused && isViewerPausedPreparationFresh(targetTime)) {
      const preparedAhead = getBufferedAhead(video, currentTime || targetTime);
      if (preparedAhead < 1.2) {
        setLocalBuffering(true);
        await waitForBufferedAhead(video, targetTime, 2.5, 2200).catch(() => false);
      }
    }

    const started = isViewerStorage
      ? await playViewerStorageWithFallback(video, false)
      : await video.play().then(
          () => true,
          () => false
        );
    dom.playUnlockOverlay.classList.toggle("hidden", state.isHost || started);
    if (isViewerStorage && started) {
      clearViewerPausedPreparation();
    }
    if (!state.isHost && started && video.readyState >= 3 && !video.seeking) {
      setLocalBuffering(false);
    }
  } else {
    video.pause();
    if (isViewerStorage) {
      resetViewerPlaybackRate();
      markViewerPausedPrepared(targetTime);
      revealViewerControls();
    }
    dom.playUnlockOverlay.classList.add("hidden");
    if (!state.isHost) {
      setLocalBuffering(false);
    }
  }

  if (isViewerStorage && !sync.isBuffering) {
    state.viewerStorageInitialSynced = true;
  }

  if (!state.isHost) {
    renderViewerTime({
      currentTime: targetTime,
      duration,
    });
    updateViewerPlaybackUi(sync);
  }
}

function loadYouTubeApi() {
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (state.youtubeApiPromise) {
    return state.youtubeApiPromise;
  }

  state.youtubeApiPromise = new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousReady === "function") {
        previousReady();
      }
      resolve();
    };

    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (existingScript) {
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => reject(new Error("تعذر تحميل مشغل يوتيوب."));
    document.head.append(script);
  });

  return state.youtubeApiPromise;
}

async function ensureYoutubePlayer(videoId) {
  if (!videoId) {
    throw new Error("رابط يوتيوب غير صالح.");
  }

  await loadYouTubeApi();
  dom.youtubeShell.classList.remove("hidden");

  if (state.youtubePlayer && state.youtubeVideoId === videoId) {
    startYoutubeTickLoop();
    return state.youtubePlayer;
  }

  if (state.youtubePlayer) {
    state.youtubeVideoId = videoId;
    state.youtubePlayer.cueVideoById(videoId);
    startYoutubeTickLoop();
    await wait(350);
    return state.youtubePlayer;
  }

  dom.youtubePlayerMount.innerHTML = "";
  const target = document.createElement("div");
  target.id = `youtube-player-${Date.now()}`;
  dom.youtubePlayerMount.append(target);

  state.youtubeVideoId = videoId;
  state.youtubePlayerReadyPromise = new Promise((resolve) => {
    state.youtubePlayerReadyResolver = resolve;
  });

  state.youtubePlayer = new window.YT.Player(target, {
    videoId,
    width: "100%",
    height: "100%",
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
    },
    events: {
      onReady: () => {
        if (typeof state.youtubePlayerReadyResolver === "function") {
          state.youtubePlayerReadyResolver(state.youtubePlayer);
        }
      },
      onStateChange: handleYoutubeStateChange,
      onError: () => showToast("تعذر تشغيل رابط يوتيوب."),
    },
  });

  await state.youtubePlayerReadyPromise;
  startYoutubeTickLoop();
  return state.youtubePlayer;
}

function cleanupYouTubePlayer() {
  stopYoutubeTickLoop();
  if (state.youtubePlayer?.destroy) {
    try {
      state.youtubePlayer.destroy();
    } catch (error) {
      console.warn(error);
    }
  }
  state.youtubePlayer = null;
  state.youtubePlayerReadyPromise = null;
  state.youtubePlayerReadyResolver = null;
  state.youtubeVideoId = "";
  state.youtubeApplyingSync = false;
  dom.youtubePlayerMount.innerHTML = "";
  dom.youtubeShell.classList.add("hidden");
  dom.playUnlockOverlay.classList.add("hidden");
}

function handleYoutubeStateChange(event) {
  if (!isYoutubeMode()) {
    return;
  }

  if (!state.isHost && event.data === window.YT?.PlayerState?.PLAYING) {
    dom.playUnlockOverlay.classList.add("hidden");
  }

  if (!state.isHost || !state.localPrepared || state.youtubeApplyingSync) {
    return;
  }

  updateHostPlaybackUi();
  if (isYoutubePlaying()) {
    requestHostWakeLock();
  } else {
    releaseHostWakeLock();
  }
  syncHostPlayback(true);

  if (event.data === window.YT?.PlayerState?.ENDED) {
    playQueuedFilmIfReady().catch((error) => console.error("queue promote failed", error));
  }
}

async function applyYoutubeSync(sync = null, force = false, allowHost = false) {
  if (!sync || (state.isHost && !allowHost)) {
    return;
  }

  const film = getActiveFilm();
  const player = await ensureYoutubePlayer(film?.youtubeId);
  const duration = getYoutubeDuration() || sync.duration || 0;
  const targetTime = getProjectedSyncTime(sync, duration);
  const currentTime = getYoutubeCurrentTime();

  state.youtubeApplyingSync = true;
  try {
    if (force || Math.abs(currentTime - targetTime) > 1.25) {
      player.seekTo(targetTime, true);
    }

    if (sync.isBuffering) {
      player.pauseVideo();
      dom.playUnlockOverlay.classList.add("hidden");
    } else if (sync.isPlaying) {
      player.playVideo();
      window.setTimeout(() => {
        if (!state.isHost && isYoutubeMode() && !isYoutubePlaying()) {
          dom.playUnlockOverlay.classList.remove("hidden");
        }
      }, 700);
    } else {
      player.pauseVideo();
      dom.playUnlockOverlay.classList.add("hidden");
    }
  } finally {
    window.setTimeout(() => {
      state.youtubeApplyingSync = false;
    }, 250);
  }

  renderViewerTime({
    currentTime: targetTime,
    duration,
  });
  updateViewerPlaybackUi(sync);
}

function getProjectedSyncTime(sync, duration = 0) {
  const baseTime = Number(sync?.currentTime || 0);
  const drift =
    sync?.isPlaying && !sync?.isBuffering ? Math.max((Date.now() - (sync.updatedAt || Date.now())) / 1000, 0) : 0;
  const projected = baseTime + drift;
  return duration ? Math.min(projected, Math.max(duration - 0.2, 0)) : projected;
}

function clampTime(value, duration = 0) {
  const upper = duration ? Math.max(duration - 0.2, 0) : Number.MAX_SAFE_INTEGER;
  return Math.min(Math.max(value, 0), upper);
}

function getYoutubeCurrentTime() {
  const time = state.youtubePlayer?.getCurrentTime?.();
  return Number.isFinite(time) ? time : state.roomData?.sync?.currentTime || 0;
}

function getYoutubeDuration() {
  const duration = state.youtubePlayer?.getDuration?.();
  const fallback = state.hostMedia.duration || state.roomData?.film?.duration || state.roomData?.sync?.duration || 0;
  return Number.isFinite(duration) && duration > 0 ? duration : fallback;
}

function isYoutubePlaying() {
  const playerState = state.youtubePlayer?.getPlayerState?.();
  return playerState === window.YT?.PlayerState?.PLAYING || playerState === window.YT?.PlayerState?.BUFFERING;
}

function startYoutubeTickLoop() {
  stopYoutubeTickLoop();
  state.youtubeSyncTimer = window.setInterval(() => {
    if (!isYoutubeMode()) {
      stopYoutubeTickLoop();
      return;
    }

    if (state.isHost) {
      updateHostPlaybackUi();
      syncHostPlayback(false);
      return;
    }

    renderViewerTime({
      currentTime: getYoutubeCurrentTime(),
      duration: getYoutubeDuration(),
    });
  }, 900);
}

function stopYoutubeTickLoop() {
  if (state.youtubeSyncTimer) {
    clearInterval(state.youtubeSyncTimer);
    state.youtubeSyncTimer = null;
  }
}

async function publishHostMovieState() {
  const now = Date.now();
  const previousPath = getDeletableStoragePath(state.roomData?.film);
  const previousQueuedPath = getDeletableStoragePath(state.roomData?.nextFilm);
  const payload = {
    status: "live",
    lastActivity: now,
    film: {
      source: "file",
      name: state.hostMedia.name,
      size: state.hostMedia.size,
      duration: roundTime(state.hostMedia.duration),
      preparedAt: now,
    },
    nextFilm: null,
    sync: {
      currentTime: 0,
      duration: roundTime(state.hostMedia.duration),
      isPlaying: false,
      isBuffering: false,
      updatedAt: now,
    },
  };
  await update(ref(db, `rooms/${state.roomId}`), payload);
  state.roomData = {
    ...(state.roomData || {}),
    ...payload,
  };
  await touchRoomIndex(state.roomId, now).catch((error) => console.warn("activity index failed", error));

  [previousPath, previousQueuedPath].forEach((path) => {
    if (path) {
      deleteStorageFile(path).catch((error) => console.warn("storage delete failed", error));
    }
  });
}

async function publishYoutubeMovieState() {
  const now = Date.now();
  const previousPath = getDeletableStoragePath(state.roomData?.film);
  const previousQueuedPath = getDeletableStoragePath(state.roomData?.nextFilm);
  const payload = {
    status: "live",
    lastActivity: now,
    film: {
      source: "youtube",
      name: state.hostMedia.name || "YouTube",
      size: 0,
      duration: roundTime(state.hostMedia.duration),
      youtubeId: state.hostMedia.youtubeId,
      url: state.hostMedia.youtubeUrl,
      preparedAt: now,
    },
    nextFilm: null,
    sync: {
      currentTime: 0,
      duration: roundTime(state.hostMedia.duration),
      isPlaying: false,
      isBuffering: false,
      updatedAt: now,
    },
  };
  await update(ref(db, `rooms/${state.roomId}`), payload);
  state.roomData = {
    ...(state.roomData || {}),
    ...payload,
  };
  await touchRoomIndex(state.roomId, now).catch((error) => console.warn("activity index failed", error));

  [previousPath, previousQueuedPath].forEach((path) => {
    if (path) {
      deleteStorageFile(path).catch((error) => console.warn("storage delete failed", error));
    }
  });
}

function updateHostPlaybackUi() {
  if (isYoutubeMode()) {
    const duration = getYoutubeDuration();
    const currentTime = getYoutubeCurrentTime();
    dom.hostMovieName.textContent = getActiveFilm()?.name || "YouTube";
    dom.hostTimeLabel.textContent = `${formatDuration(currentTime)} / ${formatDuration(duration)}`;
    setHostSeekProgress(duration ? (currentTime / duration) * 100 : 0);
    dom.hostPlayPauseButton.innerHTML = isYoutubePlaying() ? ICONS.pause : ICONS.play;
    dom.hostPlayPauseButton.setAttribute("aria-label", isYoutubePlaying() ? "إيقاف" : "تشغيل");
    return;
  }

  const duration = Number.isFinite(dom.hostVideo.duration) ? dom.hostVideo.duration : state.hostMedia.duration || 0;
  const currentTime = dom.hostVideo.currentTime || 0;
  dom.hostMovieName.textContent = state.hostMedia.name || "الفيلم";
  dom.hostTimeLabel.textContent = `${formatDuration(currentTime)} / ${formatDuration(duration)}`;
  setHostSeekProgress(duration ? (currentTime / duration) * 100 : 0);
  dom.hostPlayPauseButton.innerHTML = dom.hostVideo.paused ? ICONS.play : ICONS.pause;
  dom.hostPlayPauseButton.setAttribute("aria-label", dom.hostVideo.paused ? "تشغيل" : "إيقاف");
}

function updateViewerPlaybackUi(sync = state.roomData?.sync) {
  if (!dom.viewerPlayStatusButton || !dom.viewerPlaybackNotice) {
    return;
  }

  const isPlaying = Boolean(sync?.isPlaying && !sync?.isBuffering);
  dom.viewerPlayStatusButton.innerHTML = isPlaying ? ICONS.pause : ICONS.play;
  dom.viewerPlayStatusButton.setAttribute("aria-label", isPlaying ? "الفيلم يعمل" : "الفيلم متوقف");

  const currentTime = Number(sync?.currentTime || 0);
  let notice = "";
  if (sync && !isPlaying && isStorageMode()) {
    notice = currentTime <= 5 * 60 ? "بانتظار المنشئ لتشغيل الفيلم" : "قام المنشئ بايقاف الفيلم";
  }

  dom.viewerPlaybackNotice.textContent = notice;
  dom.viewerPlaybackNotice.classList.toggle("hidden", !notice);
}

function setHostSeekProgress(percent) {
  setSeekProgress(dom.hostSeekBar, percent);
}

function setViewerSeekProgress(percent) {
  setSeekProgress(dom.viewerSeekBar, percent);
}

function setSeekProgress(element, percent) {
  const safePercent = Math.min(Math.max(Number(percent) || 0, 0), 100);
  element.value = `${safePercent}`;
  element.style.setProperty("--seek-progress", `${safePercent}%`);
}

function handleHostSeek() {
  if (!state.isHost || !state.localPrepared) {
    return;
  }

  const duration = getHostSeekDuration();
  if (!duration) {
    return;
  }

  seekHostToTime((Number(dom.hostSeekBar.value) / 100) * duration).catch((error) =>
    console.error("host seek failed", error)
  );
}

function getHostSeekDuration() {
  if (!state.isHost || !state.localPrepared) {
    return 0;
  }

  if (isYoutubeMode()) {
    return getYoutubeDuration() || state.hostMedia.duration || state.roomData?.sync?.duration || 0;
  }

  return Number.isFinite(dom.hostVideo.duration) ? dom.hostVideo.duration : state.hostMedia.duration || 0;
}

async function seekHostToTime(time) {
  const duration = getHostSeekDuration();
  if (!duration) {
    return;
  }

  const nextTime = clampTime(time, duration);
  setHostSeekProgress((nextTime / duration) * 100);

  if (isYoutubeMode()) {
    await seekYoutubeHostToTime(nextTime, duration);
    return;
  }

  await seekNativeHostToTime(nextTime, duration);
}

async function seekNativeHostToTime(nextTime, duration) {
  const video = dom.hostVideo;
  const wasPlaying = !video.paused && !video.ended;
  const token = state.hostSeekToken + 1;
  state.hostSeekToken = token;
  state.hostSyncSuppressed = true;
  setLocalBuffering(true);

  try {
    if (wasPlaying) {
      video.pause();
    }

    video.currentTime = nextTime;
    const seekedPromise = waitForSeekCompletion(video);
    updateHostPlaybackUi();
    await publishManualHostSync(nextTime, duration, false, true);

    await seekedPromise.catch(() => {});
    await Promise.race([waitForPlayable(video), wait(4500)]).catch(() => {});

    if (state.hostSeekToken !== token) {
      return;
    }

    if (wasPlaying) {
      await prepareHostMovieAudio();
      await video.play().catch(() => {
        showToast("اضغط تشغيل بعد انتهاء تحميل المقطع.");
      });
    }
  } finally {
    if (state.hostSeekToken === token) {
      state.hostSyncSuppressed = false;
      setLocalBuffering(false);
    }
  }

  updateHostPlaybackUi();
  await syncHostPlayback(true);
}

async function seekYoutubeHostToTime(nextTime, duration) {
  if (!state.youtubePlayer?.seekTo) {
    return;
  }

  const wasPlaying = isYoutubePlaying();
  const token = state.hostSeekToken + 1;
  state.hostSeekToken = token;
  state.hostSyncSuppressed = true;
  setLocalBuffering(true);

  try {
    if (wasPlaying) {
      state.youtubePlayer.pauseVideo();
    }
    state.youtubePlayer.seekTo(nextTime, true);
    updateHostPlaybackUi();
    await publishManualHostSync(nextTime, duration, false, true);
    await wait(550);

    if (state.hostSeekToken !== token) {
      return;
    }

    if (wasPlaying) {
      state.youtubePlayer.playVideo();
      await wait(250);
    }
  } finally {
    if (state.hostSeekToken === token) {
      state.hostSyncSuppressed = false;
      setLocalBuffering(false);
    }
  }

  updateHostPlaybackUi();
  await syncHostPlayback(true);
}

function getSeekPercentFromPointer(event, element = dom.hostSeekBar) {
  const rect = element.getBoundingClientRect();
  if (!rect.width) {
    return 0;
  }

  const percent = ((event.clientX - rect.left) / rect.width) * 100;
  return Math.min(Math.max(percent, 0), 100);
}

function handleHostSeekPointerDown(event) {
  if (!state.isHost || !state.localPrepared) {
    return;
  }

  revealHostControls();
  const duration = getHostSeekDuration();
  if (!duration) {
    return;
  }

  const percent = getSeekPercentFromPointer(event);
  const targetTime = (percent / 100) * duration;
  showHostSeekPreview(percent, targetTime, event.pointerType !== "mouse");
  seekHostToTime(targetTime).catch((error) => console.error("host seek failed", error));
}

function handleHostSeekPreview(event) {
  if (!state.isHost || !state.localPrepared) {
    return;
  }

  const duration = getHostSeekDuration();
  if (!duration) {
    hideHostSeekPreview();
    return;
  }

  const percent = getSeekPercentFromPointer(event);
  showHostSeekPreview(percent, (percent / 100) * duration, false);
}

function showHostSeekPreview(percent, time, autoHide = false) {
  dom.hostSeekTooltip.textContent = formatDuration(time);
  dom.hostSeekTooltip.style.left = `${Math.min(Math.max(percent, 3), 97)}%`;
  dom.hostSeekTooltip.classList.remove("hidden");

  clearTimeout(state.hostSeekTooltipTimer);
  if (autoHide) {
    state.hostSeekTooltipTimer = window.setTimeout(hideHostSeekPreview, 900);
  }
}

function hideHostSeekPreview() {
  clearTimeout(state.hostSeekTooltipTimer);
  dom.hostSeekTooltip.classList.add("hidden");
}

function skipHostBy(seconds) {
  if (!state.isHost || !state.localPrepared) {
    return;
  }

  if (isYoutubeMode()) {
    const duration = getYoutubeDuration();
    const nextTime = clampTime(getYoutubeCurrentTime() + seconds, duration);
    seekHostToTime(nextTime).catch((error) => console.error("youtube skip failed", error));
    return;
  }

  const duration = Number.isFinite(dom.hostVideo.duration) ? dom.hostVideo.duration : state.hostMedia.duration || 0;
  seekHostToTime(clampTime((dom.hostVideo.currentTime || 0) + seconds, duration)).catch((error) =>
    console.error("host skip failed", error)
  );
}

async function toggleHostPlayback() {
  if (!state.isHost || !state.localPrepared) {
    return;
  }

  if (isYoutubeMode()) {
    await ensureYoutubePlayer(getActiveFilm()?.youtubeId || state.hostMedia.youtubeId);
    if (isYoutubePlaying()) {
      state.youtubePlayer.pauseVideo();
      releaseHostWakeLock();
    } else {
      state.youtubePlayer.playVideo();
      requestHostWakeLock();
    }
    await wait(120);
    updateHostPlaybackUi();
    await syncHostPlayback(true);
    return;
  }

  if (dom.hostVideo.paused) {
    await prepareHostMovieAudio();
    await dom.hostVideo.play().catch(() => {
      showToast("اضغط على الفيديو أو أعد المحاولة لتشغيل الفيلم.");
    });
  } else {
    dom.hostVideo.pause();
  }
}

async function syncHostPlayback(force = false) {
  if (!state.isHost || !state.localPrepared || !state.roomId) {
    return;
  }

  if (state.hostSyncSuppressed) {
    return;
  }

  if (isYoutubeMode()) {
    return syncYoutubeHostPlayback(force);
  }

  const duration = Number.isFinite(dom.hostVideo.duration) ? dom.hostVideo.duration : state.hostMedia.duration || 0;
  const currentTime = dom.hostVideo.currentTime || 0;
  const now = Date.now();
  const payload = {
    currentTime: roundTime(currentTime),
    duration: roundTime(duration),
    isPlaying: !dom.hostVideo.paused && !dom.hostVideo.ended,
    isBuffering: false,
    updatedAt: now,
  };

  const signature = JSON.stringify(payload);
  if (!force && now - state.lastSyncSentAt < 1200) {
    return;
  }
  if (!force && signature === state.lastSyncSignature) {
    return;
  }

  state.lastSyncSignature = signature;
  state.lastSyncSentAt = now;

  const roomUpdate = {
    status: "live",
    sync: payload,
    film: buildCurrentHostFilmPayload(duration, now),
  };

  if (shouldTouchRoomActivity(now, force)) {
    roomUpdate.lastActivity = now;
    touchRoomIndex(state.roomId, now).catch((error) => console.warn("activity index failed", error));
  }

  update(ref(db, `rooms/${state.roomId}`), roomUpdate).catch((error) => console.error("sync error", error));
}

async function publishManualHostSync(currentTime, duration, isPlaying, isBuffering = false) {
  if (!state.isHost || !state.roomId) {
    return;
  }

  const now = Date.now();
  const payload = {
    currentTime: roundTime(currentTime),
    duration: roundTime(duration),
    isPlaying: Boolean(isPlaying),
    isBuffering: Boolean(isBuffering),
    updatedAt: now,
  };
  const sourceKey = isYoutubeMode() ? "youtube" : "storage";
  state.lastSyncSignature = JSON.stringify({ source: sourceKey, ...payload });
  state.lastSyncSentAt = now;

  const roomUpdate = {
    status: "live",
    sync: payload,
    film: buildHostFilmPayloadForSync(duration, now),
    lastActivity: now,
  };

  await Promise.allSettled([
    update(ref(db, `rooms/${state.roomId}`), roomUpdate),
    touchRoomIndex(state.roomId, now),
  ]);
}

async function syncYoutubeHostPlayback(force = false) {
  const duration = getYoutubeDuration();
  const currentTime = getYoutubeCurrentTime();
  const now = Date.now();
  const payload = {
    currentTime: roundTime(currentTime),
    duration: roundTime(duration),
    isPlaying: isYoutubePlaying(),
    isBuffering: false,
    updatedAt: now,
  };

  const signature = JSON.stringify({ source: "youtube", ...payload });
  if (!force && now - state.lastSyncSentAt < 1200) {
    return;
  }
  if (!force && signature === state.lastSyncSignature) {
    return;
  }

  state.lastSyncSignature = signature;
  state.lastSyncSentAt = now;

  const roomUpdate = {
    status: "live",
    sync: payload,
    film: {
      source: "youtube",
      name: getActiveFilm()?.name || state.hostMedia.name || "YouTube",
      size: 0,
      duration: roundTime(duration),
      youtubeId: getActiveFilm()?.youtubeId || state.hostMedia.youtubeId,
      url: state.hostMedia.youtubeUrl || getActiveFilm()?.url || "",
      preparedAt: state.roomData?.film?.preparedAt || now,
    },
  };

  if (shouldTouchRoomActivity(now, force)) {
    roomUpdate.lastActivity = now;
    touchRoomIndex(state.roomId, now).catch((error) => console.warn("activity index failed", error));
  }

  update(ref(db, `rooms/${state.roomId}`), roomUpdate).catch((error) => console.error("youtube sync error", error));
}

function buildCurrentHostFilmPayload(duration, now = Date.now()) {
  if (isStorageMode()) {
    return {
      source: "storage",
      name: state.hostMedia.name,
      size: state.hostMedia.size,
      duration: roundTime(duration),
      storagePath: state.hostMedia.storagePath,
      url: state.hostMedia.url,
      contentType: state.hostMedia.contentType || "video/mp4",
      preparedAt: state.roomData?.film?.preparedAt || now,
    };
  }

  return {
    source: "file",
    name: state.hostMedia.name,
    size: state.hostMedia.size,
    duration: roundTime(duration),
    preparedAt: state.roomData?.film?.preparedAt || now,
  };
}

function buildHostFilmPayloadForSync(duration, now = Date.now()) {
  if (isYoutubeMode()) {
    return {
      source: "youtube",
      name: getActiveFilm()?.name || state.hostMedia.name || "YouTube",
      size: 0,
      duration: roundTime(duration),
      youtubeId: getActiveFilm()?.youtubeId || state.hostMedia.youtubeId,
      url: state.hostMedia.youtubeUrl || getActiveFilm()?.url || "",
      preparedAt: state.roomData?.film?.preparedAt || now,
    };
  }

  return buildCurrentHostFilmPayload(duration, now);
}

function renderViewerTime(sync = null) {
  const currentTime = sync?.currentTime || 0;
  const duration = sync?.duration || 0;
  dom.viewerCurrentTime.textContent = formatDuration(currentTime);
  dom.viewerRemainingTime.textContent = `- ${formatDuration(Math.max(duration - currentTime, 0))}`;
  setViewerSeekProgress(duration ? (currentTime / duration) * 100 : 0);
}

function setLocalBuffering(isBuffering) {
  if (!isBuffering) {
    clearViewerBufferingTimer();
  }
  state.localBuffering = Boolean(isBuffering);
  if (!state.viewerJoinGateActive) {
    setBufferingOverlayMode("normal");
  }
  updateBufferingOverlay();
}

function setBufferingOverlayMode(mode, seconds = 0) {
  dom.bufferingOverlay?.classList.remove("needs-audio");
  dom.bufferingAudioUnlockButton?.classList.add("hidden");

  if (mode === "join-audio") {
    if (dom.bufferingLabel) {
      dom.bufferingLabel.textContent = "اضغط هنا لبدء تشغيل الفيلم";
    }
    dom.bufferingWaitNote?.classList.remove("hidden");
    if (dom.bufferingCountdown) {
      dom.bufferingCountdown.textContent = "10";
    }
    if (dom.bufferingAudioUnlockButton) {
      dom.bufferingAudioUnlockButton.textContent = "اضغط هنا لبدء تشغيل الفيلم";
    }
    dom.bufferingAudioUnlockButton?.classList.remove("hidden");
    dom.bufferingOverlay?.classList.add("needs-audio");
    return;
  }

  if (mode === "join-start") {
    if (dom.bufferingLabel) {
      dom.bufferingLabel.textContent = "اضغط هنا لبدء تشغيل الفيلم";
    }
    dom.bufferingWaitNote?.classList.add("hidden");
    if (dom.bufferingCountdown) {
      dom.bufferingCountdown.textContent = "10";
    }
    if (dom.bufferingAudioUnlockButton) {
      dom.bufferingAudioUnlockButton.textContent = "اضغط هنا لبدء تشغيل الفيلم";
    }
    dom.bufferingAudioUnlockButton?.classList.remove("hidden");
    dom.bufferingOverlay?.classList.add("needs-audio");
    return;
  }

  if (mode === "join") {
    if (dom.bufferingLabel) {
      dom.bufferingLabel.textContent = "جاري تجهيز مقعدك";
    }
    dom.bufferingWaitNote?.classList.remove("hidden");
    if (dom.bufferingCountdown) {
      dom.bufferingCountdown.textContent = String(Math.max(seconds, 0));
    }
    return;
  }

  if (dom.bufferingLabel) {
    dom.bufferingLabel.textContent = "جاري التحميل";
  }
  dom.bufferingWaitNote?.classList.add("hidden");
  if (dom.bufferingCountdown) {
    dom.bufferingCountdown.textContent = "10";
  }
}

function clearViewerBufferingTimer() {
  if (!state.viewerBufferingTimer) {
    return;
  }

  clearTimeout(state.viewerBufferingTimer);
  state.viewerBufferingTimer = null;
}

function scheduleViewerBuffering(delay = 1300) {
  clearViewerBufferingTimer();
  state.viewerBufferingTimer = window.setTimeout(() => {
    state.viewerBufferingTimer = null;
    const sync = state.roomData?.sync || {};
    const hostExpectsMotion = Boolean(sync.isPlaying || dom.remoteVideo.seeking);
    if (!state.isHost && isStorageMode() && state.screen === "room" && hostExpectsMotion) {
      state.localBuffering = true;
      updateBufferingOverlay();
    }
  }, delay);
}

function getViewerJoinGateSeconds() {
  if (!state.viewerJoinGateUntil) {
    return VIEWER_JOIN_GATE_MS / 1000;
  }
  return Math.max(Math.ceil(getViewerJoinGateRemainingMs() / 1000), 0);
}

function getViewerJoinGateRemainingMs() {
  return Math.max(state.viewerJoinGateUntil - Date.now(), 0);
}

function isViewerJoinGateActive() {
  return Boolean(state.viewerJoinGateActive);
}

function clearViewerJoinGate() {
  if (state.viewerJoinGateTimer) {
    clearInterval(state.viewerJoinGateTimer);
    state.viewerJoinGateTimer = null;
  }
  state.viewerJoinGateActive = false;
  state.viewerJoinGateReady = false;
  state.viewerJoinGatePrerollStarted = false;
  state.viewerJoinGateMutedBeforePreroll = false;
  state.viewerJoinGateAudioBlocked = false;
  state.viewerJoinGateAwaitingStart = false;
  state.viewerJoinGateUntil = 0;
  state.viewerJoinGateTargetTime = 0;
  state.viewerJoinGateToken += 1;
  setBufferingOverlayMode("normal");
  updateBufferingOverlay();
}

function resetViewerPlaybackRate() {
  if (state.viewerCatchupTimer) {
    clearTimeout(state.viewerCatchupTimer);
    state.viewerCatchupTimer = null;
  }

  if (dom.remoteVideo) {
    dom.remoteVideo.playbackRate = 1;
  }
}

function nudgeViewerCatchup(secondsBehind) {
  resetViewerPlaybackRate();
  if (!secondsBehind || secondsBehind <= 0 || !isStorageMode()) {
    return;
  }

  const rate = secondsBehind > 1.4 ? 1.08 : 1.045;
  const duration = Math.min(Math.max(secondsBehind * 4200, 2200), 9000);
  dom.remoteVideo.playbackRate = rate;
  state.viewerCatchupTimer = window.setTimeout(resetViewerPlaybackRate, duration);
}

function clearViewerPausedPreparation() {
  state.viewerPausedPreparedPath = "";
  state.viewerPausedPreparedTime = 0;
  state.viewerPausedPreparedAt = 0;
}

function markViewerPausedPrepared(time = 0) {
  state.viewerPausedPreparedPath = dom.remoteVideo.dataset.storagePath || "";
  state.viewerPausedPreparedTime = time || 0;
  state.viewerPausedPreparedAt = Date.now();
}

function isViewerPausedPreparationFresh(targetTime = 0) {
  return Boolean(
    state.viewerPausedPreparedPath &&
      state.viewerPausedPreparedPath === (dom.remoteVideo.dataset.storagePath || "") &&
      Date.now() - state.viewerPausedPreparedAt < IDLE_ROOM_TTL_MS &&
      Math.abs((state.viewerPausedPreparedTime || 0) - (targetTime || 0)) < 3
  );
}

function getBufferedAhead(video, time = video.currentTime || 0) {
  for (let index = 0; index < video.buffered.length; index += 1) {
    const start = video.buffered.start(index);
    const end = video.buffered.end(index);
    if (time >= start - 0.05 && time <= end + 0.05) {
      return Math.max(end - time, 0);
    }
  }
  return 0;
}

async function waitForBufferedAhead(video, time, seconds = 3, timeout = 4500) {
  const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
  const needed = duration ? Math.min(seconds, Math.max(duration - time - 0.25, 0.75)) : seconds;
  if (getBufferedAhead(video, time) >= needed || video.readyState >= 4) {
    return true;
  }

  const startedAt = Date.now();
  return new Promise((resolve) => {
    let timer = null;
    const events = ["progress", "canplay", "canplaythrough", "loadeddata"];
    const cleanup = (value) => {
      clearInterval(timer);
      events.forEach((eventName) => video.removeEventListener(eventName, check));
      resolve(value);
    };
    const check = () => {
      if (getBufferedAhead(video, time) >= needed || video.readyState >= 4) {
        cleanup(true);
        return;
      }
      if (Date.now() - startedAt >= timeout) {
        cleanup(false);
      }
    };

    events.forEach((eventName) => video.addEventListener(eventName, check));
    timer = window.setInterval(check, 180);
    check();
  });
}

function updateViewerJoinGateCountdown() {
  if (!state.viewerJoinGateActive) {
    return;
  }

  if (state.viewerJoinGateAudioBlocked) {
    setBufferingOverlayMode("join-audio");
    updateBufferingOverlay();
    return;
  }

  if (state.viewerJoinGateAwaitingStart) {
    setBufferingOverlayMode("join-start");
    updateBufferingOverlay();
    return;
  }

  const seconds = getViewerJoinGateSeconds();
  setBufferingOverlayMode("join", seconds);
  updateBufferingOverlay();

  if (state.viewerJoinGateUntil && seconds <= 0) {
    finishViewerJoinGate().catch((error) => console.error("viewer gate finish failed", error));
  }
}

function shouldStartViewerJoinGate(loadedNewMovie, sync = null) {
  return Boolean(
    !state.isHost &&
      loadedNewMovie &&
      isStorageMode() &&
      sync &&
      !sync?.isBuffering &&
      (sync?.isPlaying || shouldAskViewerToStartMovie())
  );
}

function shouldAskViewerToStartMovie() {
  return Boolean(!state.isHost && state.roomId && !hasViewerStartGesture(state.roomId));
}

async function startViewerJoinGate(sync = null) {
  if (!shouldStartViewerJoinGate(true, sync) || state.viewerJoinGateActive) {
    return false;
  }

  const gateToken = state.viewerJoinGateToken + 1;
  state.viewerJoinGateToken = gateToken;
  state.viewerJoinGateActive = true;
  state.viewerJoinGateReady = false;
  state.viewerJoinGatePrerollStarted = false;
  state.viewerJoinGateMutedBeforePreroll = false;
  state.viewerJoinGateAudioBlocked = false;
  state.viewerJoinGateAwaitingStart = false;
  state.viewerJoinGateUntil = 0;
  state.viewerJoinGateTargetTime = 0;
  state.viewerStorageSyncing = true;
  state.viewerInitialLoadActive = true;

  dom.playUnlockOverlay.classList.add("hidden");
  setLocalBuffering(true);
  if (shouldAskViewerToStartMovie()) {
    showViewerJoinGateStartButton(gateToken);
    state.viewerStorageSyncing = false;
    return true;
  }

  setBufferingOverlayMode("join", getViewerJoinGateSeconds());

  try {
    await prepareAndStartViewerJoinGatePlayback(false, gateToken);
  } finally {
    state.viewerStorageSyncing = false;
  }

  return true;
}

function beginViewerJoinGateCountdown(gateToken = state.viewerJoinGateToken, ready = true) {
  if (!state.viewerJoinGateActive || state.viewerJoinGateUntil || gateToken !== state.viewerJoinGateToken) {
    return;
  }

  state.viewerJoinGateAudioBlocked = false;
  state.viewerJoinGateReady = ready;
  state.viewerJoinGatePrerollStarted = true;
  state.viewerJoinGateUntil = Date.now() + VIEWER_JOIN_GATE_MS;
  setBufferingOverlayMode("join", getViewerJoinGateSeconds());

  if (state.viewerJoinGateTimer) {
    clearInterval(state.viewerJoinGateTimer);
  }
  state.viewerJoinGateTimer = window.setInterval(updateViewerJoinGateCountdown, 200);
}

function showViewerJoinGateAudioUnlock(gateToken = state.viewerJoinGateToken) {
  if (!state.viewerJoinGateActive || gateToken !== state.viewerJoinGateToken) {
    return;
  }

  state.viewerJoinGateReady = true;
  state.viewerJoinGateAudioBlocked = true;
  state.viewerJoinGateAwaitingStart = false;
  state.viewerJoinGatePrerollStarted = false;
  state.viewerJoinGateUntil = 0;
  if (state.viewerJoinGateTimer) {
    clearInterval(state.viewerJoinGateTimer);
    state.viewerJoinGateTimer = null;
  }
  setLocalBuffering(true);
  setBufferingOverlayMode("join-audio");
  updateBufferingOverlay();
}

function showViewerJoinGateStartButton(gateToken = state.viewerJoinGateToken) {
  if (!state.viewerJoinGateActive || gateToken !== state.viewerJoinGateToken) {
    return;
  }

  state.viewerJoinGateReady = true;
  state.viewerJoinGateAudioBlocked = false;
  state.viewerJoinGateAwaitingStart = true;
  state.viewerJoinGatePrerollStarted = false;
  state.viewerJoinGateUntil = 0;
  if (state.viewerJoinGateTimer) {
    clearInterval(state.viewerJoinGateTimer);
    state.viewerJoinGateTimer = null;
  }
  setLocalBuffering(true);
  setBufferingOverlayMode("join-start");
  updateBufferingOverlay();
}

async function preparePausedViewerAfterStartGesture(sync = null, gateToken = state.viewerJoinGateToken) {
  if (!state.viewerJoinGateActive || gateToken !== state.viewerJoinGateToken) {
    return false;
  }

  const video = dom.remoteVideo;
  const duration =
    Number.isFinite(video.duration) && video.duration > 0 ? video.duration : sync?.duration || getActiveFilm()?.duration || 0;
  const targetTime = clampTime(Number(sync?.currentTime || 0), duration);

  setBufferingOverlayMode("join", getViewerJoinGateSeconds());
  beginViewerJoinGateCountdown(gateToken, false);

  try {
    if (video.readyState === 0) {
      await Promise.race([waitForVideoReady(video, "loadedmetadata"), wait(2500)]).catch(() => {});
    }
    if (Math.abs((video.currentTime || 0) - targetTime) > 0.25) {
      video.currentTime = targetTime;
      await Promise.race([waitForSeekCompletion(video, 1800), wait(1800)]).catch(() => {});
    }
    await Promise.race([waitForPlayable(video), wait(2200)]).catch(() => {});
    await waitForBufferedAhead(video, targetTime, 10, VIEWER_JOIN_GATE_MS - 1500).catch(() => false);
    video.muted = false;
    video.volume = 1;
    const primed = await video.play().then(
      () => true,
      () => false
    );
    if (primed) {
      video.pause();
      video.currentTime = targetTime;
    }
    await waitForBufferedAhead(video, targetTime, 10, 2200).catch(() => false);
    markViewerPausedPrepared(targetTime);
  } finally {
    state.viewerStorageInitialSynced = true;
    state.viewerInitialLoadActive = false;
    renderViewerTime({
      currentTime: targetTime,
      duration,
    });
    updateViewerPlaybackUi(sync);
    revealViewerControls();
    if (state.viewerJoinGateActive && gateToken === state.viewerJoinGateToken) {
      state.viewerJoinGateReady = true;
      updateViewerJoinGateCountdown();
    }
  }

  return true;
}

async function prepareAndStartViewerJoinGatePlayback(fromGesture = false, gateToken = state.viewerJoinGateToken) {
  if (!state.viewerJoinGateActive || gateToken !== state.viewerJoinGateToken) {
    return false;
  }

  const video = dom.remoteVideo;
  if (video.readyState === 0) {
    await Promise.race([waitForVideoReady(video, "loadedmetadata"), wait(3500)]).catch(() => {});
  }

  const sync = state.roomData?.sync || {};
  if (!sync.isPlaying || sync.isBuffering) {
    if (!sync.isBuffering) {
      return preparePausedViewerAfterStartGesture(sync, gateToken);
    }

    clearViewerJoinGate();
    await applyStorageSync(sync);
    return false;
  }

  const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : sync.duration || getActiveFilm()?.duration || 0;
  const startTime = clampTime(getProjectedSyncTime(sync, duration), duration);
  state.viewerJoinGateTargetTime = clampTime(startTime + VIEWER_JOIN_GATE_MS / 1000, duration);
  renderViewerTime({
    currentTime: startTime,
    duration,
  });

  try {
    if (Math.abs((video.currentTime || 0) - startTime) > 0.25) {
      video.currentTime = startTime;
    }
  } catch (error) {
    console.warn("viewer gate seek failed", error);
  }

  video.muted = false;
  video.volume = 1;
  state.viewerJoinGateAudioBlocked = false;
  state.viewerJoinGateAwaitingStart = false;
  setBufferingOverlayMode("join", getViewerJoinGateSeconds());

  let playRejected = false;
  const playPromise = video.play().then(
    () => true,
    (error) => {
      playRejected = true;
      console.warn("audible autoplay blocked", error);
      return false;
    }
  );

  const started = await Promise.race([
    playPromise,
    waitForVideoReady(video, "playing").then(
      () => true,
      () => false
    ),
    wait(fromGesture ? 2500 : 1200).then(() => null),
  ]);

  if (gateToken !== state.viewerJoinGateToken) {
    return false;
  }

  if (started === true || (!video.paused && !video.muted)) {
    await Promise.race([waitForSeekCompletion(video, 2500), wait(2500)]).catch(() => {});
    await Promise.race([waitForPlayable(video), wait(3500)]).catch(() => {});
    state.viewerInitialLoadActive = false;
    beginViewerJoinGateCountdown(gateToken);
    return true;
  }

  if (playRejected || started === false) {
    showViewerJoinGateAudioUnlock(gateToken);
    return false;
  }

  playPromise.then((allowed) => {
    if (!state.viewerJoinGateActive || state.viewerJoinGateUntil || gateToken !== state.viewerJoinGateToken) {
      return;
    }
    if (allowed || (!video.paused && !video.muted)) {
      state.viewerInitialLoadActive = false;
      beginViewerJoinGateCountdown(gateToken);
      return;
    }
    showViewerJoinGateAudioUnlock(gateToken);
  });
  return false;
}

async function handleViewerJoinGateAudioUnlock() {
  if (!state.viewerJoinGateActive || (!state.viewerJoinGateAudioBlocked && !state.viewerJoinGateAwaitingStart)) {
    return;
  }

  markViewerStartGesture(state.roomId);
  state.viewerJoinGateAwaitingStart = false;
  state.viewerJoinGateAudioBlocked = false;
  dom.playUnlockOverlay.classList.add("hidden");
  setBufferingOverlayMode("join", VIEWER_JOIN_GATE_MS / 1000);
  await prepareAndStartViewerJoinGatePlayback(true, state.viewerJoinGateToken);
}

async function playViewerStorageWithFallback(video = dom.remoteVideo, restoreMuted = false) {
  dom.playUnlockOverlay.classList.add("hidden");

  if (!video.paused) {
    if (video.muted !== restoreMuted) {
      window.setTimeout(() => {
        video.muted = restoreMuted;
      }, 120);
    }
    return true;
  }

  let started = await video.play().then(
    () => true,
    () => false
  );

  if (started) {
    window.setTimeout(() => {
      video.muted = restoreMuted;
    }, 180);
  }

  return started;
}

async function finishViewerJoinGate() {
  if (!state.viewerJoinGateActive || !state.viewerJoinGateReady) {
    return;
  }

  if (state.viewerJoinGateTimer) {
    clearInterval(state.viewerJoinGateTimer);
    state.viewerJoinGateTimer = null;
  }

  const video = dom.remoteVideo;
  const sync = state.roomData?.sync || {};
  const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : sync.duration || 0;
  const expectedTime = getProjectedSyncTime(sync, duration);
  state.viewerJoinGateActive = false;
  state.viewerJoinGateReady = false;
  state.viewerJoinGatePrerollStarted = false;
  state.viewerStorageInitialSynced = true;
  state.viewerInitialLoadActive = false;
  setBufferingOverlayMode("normal");

  if (sync.isPlaying && !sync.isBuffering) {
    const drift = expectedTime - (video.currentTime || 0);
    if (Math.abs(drift) > 2.4) {
      video.currentTime = expectedTime;
      await Promise.race([waitForSeekCompletion(video, 1300), wait(1300)]).catch(() => {});
    } else if (drift > 0.35) {
      nudgeViewerCatchup(drift);
    }

    video.muted = false;
    await playViewerStorageWithFallback(video, false);
  } else {
    video.pause();
    resetViewerPlaybackRate();
    video.muted = false;
    dom.playUnlockOverlay.classList.add("hidden");
  }

  renderViewerTime({
    currentTime: video.currentTime || expectedTime || state.viewerJoinGateTargetTime,
    duration,
  });
  updateViewerPlaybackUi(sync);
  state.viewerJoinGateTargetTime = 0;
  state.viewerJoinGateMutedBeforePreroll = false;
  setLocalBuffering(false);
}

function updateBufferingOverlay() {
  const roomBuffering = Boolean(state.roomData?.sync?.isBuffering && state.roomData?.sync?.isPlaying);
  const joinGate = isViewerJoinGateActive();
  const shouldShow = state.screen === "room" && (joinGate || state.localBuffering || (!state.isHost && roomBuffering));
  if (joinGate && state.viewerJoinGateAwaitingStart) {
    setBufferingOverlayMode("join-start");
  } else if (joinGate && state.viewerJoinGateAudioBlocked) {
    setBufferingOverlayMode("join-audio");
  } else if (joinGate) {
    setBufferingOverlayMode("join", getViewerJoinGateSeconds());
  } else {
    setBufferingOverlayMode("normal");
  }
  dom.bufferingOverlay.classList.toggle("hidden", !shouldShow);
}

function handleHostBufferingEvent(isBuffering) {
  if (!state.isHost || !state.localPrepared || !state.roomId || state.hostSyncSuppressed || isYoutubeMode()) {
    return;
  }

  const now = Date.now();
  if (isBuffering) {
    if ((dom.hostVideo.paused && !dom.hostVideo.seeking) || dom.hostVideo.ended) {
      setLocalBuffering(false);
      return;
    }

    setLocalBuffering(true);
    if (now - state.lastBufferingSyncAt < 900) {
      return;
    }
    state.lastBufferingSyncAt = now;
    const duration = getHostSeekDuration();
    publishManualHostSync(dom.hostVideo.currentTime || 0, duration, true, true).catch((error) =>
      console.error("buffering sync error", error)
    );
    return;
  }

  setLocalBuffering(false);
  syncHostPlayback(true);
}

function handleViewerBufferingEvent(isBuffering) {
  if (state.isHost || !isStorageMode()) {
    return;
  }

  if (state.viewerJoinGateActive) {
    updateViewerJoinGateCountdown();
    return;
  }

  if (isBuffering) {
    const sync = state.roomData?.sync || {};
    const isInitialFrameLoading = state.viewerInitialLoadActive || dom.remoteVideo.readyState < 2;
    const isExpectedSeekLoading = Boolean((sync.isBuffering && sync.isPlaying) || dom.remoteVideo.seeking);
    const hostPaused = Boolean(sync && !sync.isPlaying && !sync.isBuffering);

    if (hostPaused && !isInitialFrameLoading && !state.viewerJoinGateActive) {
      setLocalBuffering(false);
      return;
    }

    if (isInitialFrameLoading) {
      setLocalBuffering(true);
      return;
    }

    if (isExpectedSeekLoading) {
      scheduleViewerBuffering(450);
      return;
    }

    scheduleViewerBuffering(1500);
    return;
  }

  if (dom.remoteVideo.readyState >= 3 && !dom.remoteVideo.seeking) {
    state.viewerInitialLoadActive = false;
    setLocalBuffering(false);
  }
}

function updateWaitingOverlay() {
  const creatorOnline = !!state.roomData?.creatorId && state.members.has(state.roomData.creatorId);
  const roomIsLive = state.roomData?.status === "live";
  const youtubeMode = isYoutubeMode();
  const storageMode = isStorageMode();

  if (state.isHost && state.localPrepared) {
    dom.waitingState.classList.add("hidden");
    return;
  }

  if (state.isHost && !state.localPrepared) {
    dom.waitingTitle.textContent = "حمّل الفيلم";
    dom.waitingText.textContent = "";
    dom.waitingState.classList.remove("hidden");
    return;
  }

  if (!creatorOnline) {
    dom.waitingTitle.textContent = "غير متصل";
    dom.waitingText.textContent = "";
    dom.waitingState.classList.remove("hidden");
    return;
  }

  if (!roomIsLive) {
    dom.waitingTitle.textContent = "بانتظار الفيلم";
    dom.waitingText.textContent = "";
    dom.waitingState.classList.remove("hidden");
    return;
  }

  if (youtubeMode) {
    if (state.youtubePlayer) {
      dom.waitingState.classList.add("hidden");
    } else {
      dom.waitingTitle.textContent = "جاري الاتصال";
      dom.waitingText.textContent = "";
      dom.waitingState.classList.remove("hidden");
    }
    return;
  }

  if (storageMode) {
    if (dom.remoteVideo.src || state.isHost) {
      dom.waitingState.classList.add("hidden");
    } else {
      dom.waitingTitle.textContent = "جاري الاتصال";
      dom.waitingText.textContent = "";
      dom.waitingState.classList.remove("hidden");
    }
    return;
  }

  if (!state.viewerRemoteStream || !state.viewerRemoteStream.getVideoTracks().length) {
    dom.waitingTitle.textContent = "جاري الاتصال";
    dom.waitingText.textContent = "";
    dom.waitingState.classList.remove("hidden");
    return;
  }

  dom.waitingState.classList.add("hidden");
}

async function handleSendMessage(event) {
  event.preventDefault();
  const text = dom.chatInput.value.trim();
  if (!text || !state.roomId) {
    return;
  }

  try {
    const payload = {
      senderId: state.memberId,
      senderName: state.name,
      senderAvatar: state.avatar,
      text,
      createdAt: Date.now(),
    };

    if (state.replyDraft) {
      payload.replyTo = {
        messageId: state.replyDraft.messageId,
        senderName: state.replyDraft.senderName,
        text: state.replyDraft.text,
      };
    }

    await push(ref(db, `rooms/${state.roomId}/messages`), payload);
  } catch (error) {
    console.error(error);
    showToast(getFriendlyErrorMessage(error));
    return;
  }

  dom.chatInput.value = "";
  cancelReply();
  dom.chatInput.focus();
}

function renderMessage(message) {
  const item = document.createElement("article");
  item.className = "message-item";
  if (message.senderId === state.memberId) {
    item.classList.add("message-own");
  }

  const avatar = document.createElement("img");
  avatar.className = "message-avatar";
  avatar.src = message.senderAvatar || createAvatar(message.senderId || createClientId(), message.senderName || "ضيف");
  avatar.alt = message.senderName || "عضو";

  const card = document.createElement("div");
  card.className = "message-card";

  const head = document.createElement("div");
  head.className = "message-head";

  const headMain = document.createElement("div");
  headMain.className = "message-head-main";

  const author = document.createElement("div");
  author.className = "message-author";
  author.textContent = message.senderName || "ضيف";

  const time = document.createElement("div");
  time.className = "message-time";
  time.textContent = formatClock(message.createdAt);

  headMain.append(author, time);

  const replyButton = document.createElement("button");
  replyButton.className = "message-reply-button";
  replyButton.type = "button";
  replyButton.setAttribute("aria-label", "رد على الرسالة");
  replyButton.innerHTML = ICONS.reply;
  replyButton.addEventListener("click", () => startReply(message));

  head.append(headMain, replyButton);
  card.append(head);

  if (message.replyTo?.text) {
    const quote = document.createElement("div");
    quote.className = "message-quote";

    const quoteName = document.createElement("div");
    quoteName.className = "message-quote-name";
    quoteName.textContent = message.replyTo.senderName || "رسالة";

    const quoteText = document.createElement("div");
    quoteText.className = "message-quote-text";
    quoteText.textContent = message.replyTo.text || "";

    quote.append(quoteName, quoteText);
    card.append(quote);
  }

  const text = document.createElement("div");
  text.className = "message-text";
  text.textContent = message.text || "";

  card.append(text);
  item.append(avatar, card);
  dom.messagesList.append(item);
  dom.messagesList.scrollTop = dom.messagesList.scrollHeight;
  showTheaterChatMessage(message);
}

function renderSystemMessage(text) {
  const item = document.createElement("div");
  item.className = "system-message";
  item.textContent = text;
  dom.messagesList.append(item);
  dom.messagesList.scrollTop = dom.messagesList.scrollHeight;
}

function showTheaterChatMessage(message) {
  if (!isExpandedPlayer() || state.screen !== "room") {
    return;
  }

  if (!message.createdAt || message.createdAt < state.joinedAt - 5000) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = "theater-chat-toast";

  const name = document.createElement("div");
  name.className = "theater-chat-name";
  name.textContent = message.senderName || "ضيف";

  const text = document.createElement("div");
  text.className = "theater-chat-text";
  text.textContent = message.text || "";

  toast.append(name, text);
  dom.theaterChatOverlay.append(toast);

  while (dom.theaterChatOverlay.children.length > 3) {
    dom.theaterChatOverlay.firstElementChild?.remove();
  }

  window.setTimeout(() => {
    toast.remove();
  }, 4200);
}

function renderPresenceEvents(nextMembers) {
  if (!state.presenceReady) {
    state.knownMemberIds = new Set(nextMembers.keys());
    state.presenceReady = true;
    return;
  }

  nextMembers.forEach((member, memberId) => {
    if (memberId !== state.memberId && !state.knownMemberIds.has(memberId)) {
      renderSystemMessage(`انضم ${member.name || "ضيف"}`);
    }
  });

  state.knownMemberIds.forEach((memberId) => {
    if (memberId !== state.memberId && !nextMembers.has(memberId)) {
      const previousMember = state.members.get(memberId);
      renderSystemMessage(`غادر ${previousMember?.name || "ضيف"}`);
    }
  });

  state.knownMemberIds = new Set(nextMembers.keys());
}

function startReply(message) {
  state.replyDraft = {
    messageId: message.id || "",
    senderName: message.senderName || "ضيف",
    text: truncateReplyText(message.text || ""),
  };
  renderReplyPreview();
  dom.chatInput.focus();
}

function cancelReply() {
  state.replyDraft = null;
  renderReplyPreview();
}

function renderReplyPreview() {
  if (!state.replyDraft) {
    dom.replyPreview.classList.add("hidden");
    dom.replyPreviewName.textContent = "";
    dom.replyPreviewText.textContent = "";
    return;
  }

  dom.replyPreviewName.textContent = state.replyDraft.senderName;
  dom.replyPreviewText.textContent = state.replyDraft.text;
  dom.replyPreview.classList.remove("hidden");
}

function renderParticipants() {
  const members = Array.from(state.members.values()).sort((left, right) => {
    if (left.isHost && !right.isHost) {
      return -1;
    }
    if (!left.isHost && right.isHost) {
      return 1;
    }
    return (left.joinedAt || 0) - (right.joinedAt || 0);
  });

  dom.participantsList.innerHTML = "";
  dom.membersCountBadge.textContent = `${members.length}`;

  members.forEach((member) => {
    const item = document.createElement("div");
    item.className = "participant-item";

    const avatar = document.createElement("img");
    avatar.className = "participant-avatar";
    avatar.src = member.avatar;
    avatar.alt = member.name;

    const textWrap = document.createElement("div");

    const titleRow = document.createElement("div");
    titleRow.className = "participant-name-row";

    const name = document.createElement("div");
    name.className = "participant-name";
    name.textContent = member.name || "ضيف";

    titleRow.append(name);

    if (member.isHost) {
      const crown = document.createElement("span");
      crown.className = "participant-crown";
      crown.textContent = "👑";
      titleRow.append(crown);
    }

    const meta = document.createElement("div");
    meta.className = "participant-meta";
    meta.textContent = member.id === state.memberId ? "أنت" : "";

    textWrap.append(titleRow, meta);

    const mic = document.createElement("div");
    mic.className = `participant-mic ${member.micEnabled ? "" : "off"}`;
    mic.innerHTML = ICONS.mic;

    item.append(avatar, textWrap, mic);
    dom.participantsList.append(item);
  });
}

function updateViewerCount() {
  const count = state.members.size || (state.roomId ? 1 : 0);
  dom.viewerCountValue.textContent = `${count}`;
  dom.viewerCountPill.setAttribute("aria-label", `المتصلون في الغرفة ${count}`);
}

function openDrawer(event = null) {
  event?.stopPropagation();
  if (!dom.profileDrawer.classList.contains("hidden")) {
    closeDrawer();
    return;
  }
  syncRenameSaveVisibility();
  positionProfileDrawer(true);
  dom.profileDrawer.classList.remove("hidden");
}

function closeDrawer() {
  dom.profileDrawer.classList.add("hidden");
}

function handleMembersPillKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  openMembersDrawer(event);
}

function openMembersDrawer(event = null) {
  event?.stopPropagation();
  if (!state.roomId) {
    return;
  }

  if (!dom.membersDrawer.classList.contains("hidden")) {
    closeMembersDrawer();
    return;
  }

  renderParticipants();
  positionMembersDrawer(true);
  dom.membersDrawer.classList.remove("hidden");
}

function closeMembersDrawer() {
  dom.membersDrawer.classList.add("hidden");
}

function positionProfileDrawer(force = false) {
  if (!force && dom.profileDrawer.classList.contains("hidden")) {
    return;
  }

  const rect = dom.profileButton.getBoundingClientRect();
  const width = Math.min(340, window.innerWidth - 16);
  const left = Math.min(Math.max(rect.right - width, 8), window.innerWidth - width - 8);
  const top = Math.min(rect.bottom + 8, window.innerHeight - 16);
  dom.profileDrawer.style.setProperty("--drawer-left", `${left}px`);
  dom.profileDrawer.style.setProperty("--drawer-top", `${top}px`);
}

function positionMembersDrawer(force = false) {
  if (!force && dom.membersDrawer.classList.contains("hidden")) {
    return;
  }

  const rect = dom.viewerCountPill.getBoundingClientRect();
  const width = Math.min(320, window.innerWidth - 16);
  const left = Math.min(Math.max(rect.right - width, 8), window.innerWidth - width - 8);
  const top = Math.min(rect.bottom + 8, window.innerHeight - 16);
  dom.membersDrawer.style.setProperty("--drawer-left", `${left}px`);
  dom.membersDrawer.style.setProperty("--drawer-top", `${top}px`);
}

async function handleLeaveRoom() {
  const approved = await askForConfirmation("خروج", "هل تريد الخروج من الغرفة؟");
  if (!approved) {
    return;
  }
  await leaveRoom();
}

async function leaveRoom() {
  const roomId = state.roomId;
  const memberId = state.memberId;
  const wasHost = state.isHost;

  cleanupRoomSubscriptions();
  cleanupViewerReconnect();
  closeAllPeers();
  closeDrawer();
  closeMembersDrawer();

  if (roomId && memberId) {
    await remove(ref(db, `rooms/${roomId}/members/${memberId}`)).catch(() => {});
  }

  clearRoomSession(roomId);
  if (wasHost) {
    await clearPersistedHostMovie(roomId).catch(() => {});
  }

  resetHostMovieState();
  state.roomId = null;
  state.roomData = null;
  state.memberId = null;
  state.routeRoomId = null;
  state.isHost = false;
  state.micEnabled = false;
  state.members = new Map();
  state.knownMemberIds.clear();
  state.presenceReady = false;
  state.messageIds.clear();
  dom.messagesList.innerHTML = "";
  cancelReply();
  renderParticipants();
  updateViewerCount();
  updateMicButton();
  navigateHome();
  showToast("تم الخروج من الغرفة.");
}

async function deleteCurrentRoom(successMessage = "تم حذف الغرفة.") {
  const roomId = state.roomId || state.routeRoomId;
  const wasHost = state.isHost;

  cleanupRoomSubscriptions();
  cleanupViewerReconnect();
  closeAllPeers();
  closeDrawer();
  closeMembersDrawer();
  resetHostMovieState();

  await deleteRoomById(roomId);

  clearRoomSession(roomId);
  if (wasHost) {
    await clearPersistedHostMovie(roomId).catch(() => {});
  }

  state.roomId = null;
  state.roomData = null;
  state.memberId = null;
  state.routeRoomId = null;
  state.isHost = false;
  state.micEnabled = false;
  state.lastActivitySentAt = 0;
  state.members = new Map();
  state.knownMemberIds.clear();
  state.presenceReady = false;
  state.messageIds.clear();
  dom.messagesList.innerHTML = "";
  cancelReply();
  renderParticipants();
  updateViewerCount();
  updateMicButton();
  navigateHome();
  showToast(successMessage);
}

async function handleRenameSubmit(event) {
  event.preventDefault();
  const nextName = sanitizeName(dom.renameInput.value);
  if (!nextName) {
    showToast("الاسم لا يمكن أن يكون فارغاً.");
    return;
  }

  state.name = nextName;
  state.avatar = createAvatar(state.memberId, nextName);
  dom.renameInput.value = nextName;
  savePreferredName(nextName);
  saveRoomSession({
    roomId: state.roomId,
    memberId: state.memberId,
    isHost: state.isHost,
    name: nextName,
    avatar: state.avatar,
  });

  updateProfileUi();
  await update(ref(db, `rooms/${state.roomId}/members/${state.memberId}`), buildMemberPayload());

  if (state.isHost) {
    update(ref(db, `rooms/${state.roomId}`), { creatorName: nextName }).catch(() => {});
  }

  syncRenameSaveVisibility();
  showToast("تم تحديث الاسم.");
}

function toggleHostMenu(event) {
  event.stopPropagation();
  dom.hostMenuPanel.classList.toggle("hidden");
}

async function copyRoomLink() {
  const url = buildShareUrl(state.roomId);
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      const temp = document.createElement("textarea");
      temp.value = url;
      document.body.append(temp);
      temp.select();
      document.execCommand("copy");
      temp.remove();
    }
    showToast("تم نسخ رابط الغرفة.");
  } catch (error) {
    console.error(error);
    showToast("تعذر نسخ الرابط تلقائياً.");
  } finally {
    dom.hostMenuPanel.classList.add("hidden");
  }
}

async function handleMicToggle() {
  if (!state.micEnabled) {
    const approved = await askForConfirmation(
      "تشغيل الميكروفون",
      "سيتم تشغيل الميكروفون الآن، وكل الموجودين في غرفة السينما سيتمكنون من سماعك. هل تريد المتابعة؟"
    );
    if (!approved) {
      return;
    }

    try {
      await enableMicrophone();
      showToast("تم تشغيل الميكروفون.");
    } catch (error) {
      console.error(error);
      showToast("تعذر تشغيل الميكروفون. تأكد من السماح للمتصفح.");
    }
    return;
  }

  await disableMicrophone();
  showToast("تم إيقاف الميكروفون.");
}

async function enableMicrophone() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  const [track] = stream.getAudioTracks();
  if (!track) {
    throw new Error("لم يتم العثور على مسار صوتي.");
  }

  state.micEnabled = true;

  if (state.isHost) {
    await ensureHostAudioContext();
    detachHostMicFromMixes();
    state.hostMicTrack?.stop();
    state.hostMicTrack = track;
    state.hostMicSourceNode = state.hostAudioContext.createMediaStreamSource(new MediaStream([track]));
    state.viewerMixes.forEach((mix) => attachHostMicToMix(mix));
  } else {
    state.viewerMicTrack?.stop();
    state.viewerMicTrack = track;
    const sender = await ensureViewerMicSender();
    await sender.replaceTrack(track);
  }

  track.addEventListener("ended", () => {
    if (state.micEnabled) {
      disableMicrophone();
    }
  });

  updateMicButton();
  await refreshMemberPresence();
}

async function disableMicrophone() {
  state.micEnabled = false;

  if (state.isHost) {
    detachHostMicFromMixes();
    if (state.hostMicSourceNode) {
      try {
        state.hostMicSourceNode.disconnect();
      } catch (error) {
        console.warn(error);
      }
    }
    state.hostMicSourceNode = null;
    state.hostMicTrack?.stop();
    state.hostMicTrack = null;
  } else {
    if (state.viewerMicSender) {
      const silentTrack = await ensureViewerSilentTrack();
      await state.viewerMicSender.replaceTrack(silentTrack);
    }
    state.viewerMicTrack?.stop();
    state.viewerMicTrack = null;
  }

  updateMicButton();
  await refreshMemberPresence();
}

function updateMicButton() {
  dom.micToggleButton.classList.toggle("mic-on", state.micEnabled);
  dom.micToggleButton.classList.toggle("mic-off", !state.micEnabled);
}

async function refreshMemberPresence() {
  if (!state.roomId || !state.memberId) {
    return;
  }

  await update(ref(db, `rooms/${state.roomId}/members/${state.memberId}`), buildMemberPayload());
}

async function askForConfirmation(title, message) {
  dom.confirmTitle.textContent = title;
  dom.confirmMessage.textContent = message;
  dom.confirmModal.classList.remove("hidden");

  return new Promise((resolve) => {
    state.confirmResolver = resolve;
  });
}

function resolveConfirm(result) {
  if (typeof state.confirmResolver === "function") {
    state.confirmResolver(result);
  }
  state.confirmResolver = null;
  dom.confirmModal.classList.add("hidden");
}

async function handleSignal(signal) {
  if (!signal?.type || !signal.from) {
    return;
  }

  if (signal.type === "viewer-ready" && state.isHost) {
    if (!state.localPrepared) {
      state.pendingViewers.add(signal.from);
      return;
    }
    await createOfferForViewer(signal.from);
    return;
  }

  if (signal.type === "offer" && !state.isHost) {
    await handleViewerOffer(signal.from, signal.sdp);
    return;
  }

  if (signal.type === "answer" && state.isHost) {
    await handleHostAnswer(signal.from, signal.sdp);
    return;
  }

  if (signal.type === "ice") {
    await handleIceCandidate(signal.from, signal.candidate);
  }
}

async function sendSignal(targetId, payload) {
  await push(ref(db, `rooms/${state.roomId}/signals/${targetId}`), {
    ...payload,
    from: state.memberId,
    sentAt: Date.now(),
  });
}

async function createOfferForViewer(viewerId) {
  if (!state.localPrepared || (!state.hostVideoTrack && !isYoutubeMode() && !isStorageMode())) {
    state.pendingViewers.add(viewerId);
    return;
  }

  const peer = await createHostPeer(viewerId);
  const offer = await peer.pc.createOffer();
  await peer.pc.setLocalDescription(offer);
  await sendSignal(viewerId, {
    type: "offer",
    sdp: peer.pc.localDescription.toJSON ? peer.pc.localDescription.toJSON() : peer.pc.localDescription,
  });
}

async function createHostPeer(viewerId) {
  cleanupPeer(viewerId);

  const pc = createPeer(viewerId, "host");
  const mix = await ensureViewerMix(viewerId);
  const outboundStream = new MediaStream();
  if (state.hostVideoTrack) {
    outboundStream.addTrack(state.hostVideoTrack);
  }
  outboundStream.addTrack(mix.audioTrack);

  const videoSender = state.hostVideoTrack ? pc.addTrack(state.hostVideoTrack, outboundStream) : null;
  pc.addTrack(mix.audioTrack, outboundStream);
  await tuneVideoSender(videoSender);
  pc.ontrack = (event) => handleIncomingViewerAudio(viewerId, event);

  const peer = {
    role: "host",
    pc,
    mix,
    outboundStream,
  };

  state.peers.set(viewerId, peer);
  return peer;
}

async function tuneVideoSender(sender) {
  if (!sender?.getParameters || !sender?.setParameters) {
    return;
  }

  const parameters = sender.getParameters();
  if (!parameters.encodings?.length) {
    parameters.encodings = [{}];
  }

  if (!parameters.encodings.length) {
    return;
  }

  parameters.degradationPreference = "balanced";
  parameters.encodings[0].maxBitrate = getTargetVideoBitrate();
  parameters.encodings[0].maxFramerate = HOST_VIDEO_MAX_FRAMERATE;
  parameters.encodings[0].scaleResolutionDownBy = 1;

  await sender.setParameters(parameters).catch((error) => {
    console.warn("video sender tuning failed", error);
  });
}

function retuneHostVideoSenders() {
  if (!state.isHost) {
    return;
  }

  state.peers.forEach((peer) => {
    if (peer.role !== "host") {
      return;
    }
    const sender = peer.pc.getSenders().find((item) => item.track?.kind === "video");
    tuneVideoSender(sender).catch((error) => console.warn("video sender retune failed", error));
  });
}

function getTargetVideoBitrate() {
  const viewerCount = Math.max((state.members.size || 1) - 1, 1);
  if (viewerCount <= 1) {
    return HOST_VIDEO_HIGH_BITRATE;
  }
  if (viewerCount === 2) {
    return HOST_VIDEO_MEDIUM_BITRATE;
  }
  if (viewerCount <= 4) {
    return HOST_VIDEO_LOW_BITRATE;
  }
  return HOST_VIDEO_MIN_BITRATE;
}

function createPeer(peerId, role) {
  const pc = new RTCPeerConnection(RTC_CONFIGURATION);

  pc.onicecandidate = (event) => {
    if (!event.candidate) {
      return;
    }
    sendSignal(peerId, {
      type: "ice",
      candidate: event.candidate.toJSON ? event.candidate.toJSON() : event.candidate,
    }).catch((error) => console.error("ice error", error));
  };

  pc.onconnectionstatechange = () => {
    if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
      cleanupPeer(peerId);
      if (role === "viewer") {
        scheduleViewerReconnect(1200);
      }
    }
  };

  return pc;
}

async function handleHostAnswer(viewerId, sdp) {
  const peer = state.peers.get(viewerId);
  if (!peer) {
    return;
  }
  await peer.pc.setRemoteDescription(new RTCSessionDescription(sdp));
}

async function handleViewerOffer(hostId, sdp) {
  const peer = await createViewerPeer(hostId);
  await peer.pc.setRemoteDescription(new RTCSessionDescription(sdp));
  const answer = await peer.pc.createAnswer();
  await peer.pc.setLocalDescription(answer);
  await sendSignal(hostId, {
    type: "answer",
    sdp: peer.pc.localDescription.toJSON ? peer.pc.localDescription.toJSON() : peer.pc.localDescription,
  });
}

async function createViewerPeer(hostId) {
  cleanupPeer(hostId);

  const pc = createPeer(hostId, "viewer");
  const outboundTrack = state.micEnabled && state.viewerMicTrack ? state.viewerMicTrack : await ensureViewerSilentTrack();
  const localStream = new MediaStream([outboundTrack]);
  const sender = pc.addTrack(outboundTrack, localStream);

  pc.ontrack = (event) => handleIncomingHostTrack(event);

  const peer = {
    role: "viewer",
    pc,
    sender,
  };

  state.peers.set(hostId, peer);
  state.viewerMicSender = sender;
  return peer;
}

async function ensureViewerMicSender() {
  if (state.viewerMicSender) {
    return state.viewerMicSender;
  }
  const hostId = state.roomData?.creatorId;
  if (!hostId) {
    throw new Error("لا يوجد منشئ للغرفة حالياً.");
  }
  const peer = state.peers.get(hostId) || (await createViewerPeer(hostId));
  state.viewerMicSender = peer.sender;
  return peer.sender;
}

async function ensureViewerSilentTrack() {
  if (state.viewerSilentTrack) {
    return state.viewerSilentTrack;
  }

  if (!state.viewerAudioContext) {
    state.viewerAudioContext = new AudioContext();
  }

  const context = state.viewerAudioContext;
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const destination = context.createMediaStreamDestination();

  gainNode.gain.value = 0;
  oscillator.connect(gainNode).connect(destination);
  oscillator.start();

  state.viewerSilentTrack = destination.stream.getAudioTracks()[0];
  return state.viewerSilentTrack;
}

function handleIncomingHostTrack(event) {
  if (isStorageMode()) {
    const stream = event.streams[0] || new MediaStream([event.track]);
    if (event.track.kind === "audio") {
      dom.remoteAudio.srcObject = stream;
      dom.remoteAudio.play().catch(() => {});
    }
    updateWaitingOverlay();
    return;
  }

  if (!state.viewerRemoteStream) {
    state.viewerRemoteStream = new MediaStream();
  }

  if (!state.viewerRemoteStream.getTracks().find((track) => track.id === event.track.id)) {
    state.viewerRemoteStream.addTrack(event.track);
  }

  dom.remoteVideo.srcObject = state.viewerRemoteStream;
  dom.remoteVideo.muted = true;
  dom.remoteAudio.srcObject = state.viewerRemoteStream;
  attemptRemotePlayback();
  updateWaitingOverlay();
}

function handleIncomingViewerAudio(viewerId, event) {
  if (event.track.kind !== "audio" || !state.hostAudioContext) {
    return;
  }

  if (state.remoteSources.has(viewerId)) {
    return;
  }

  const stream = event.streams[0] || new MediaStream([event.track]);
  const sourceNode = state.hostAudioContext.createMediaStreamSource(stream);
  state.remoteSources.set(viewerId, sourceNode);
  attachRemoteSourceToEligibleMixes(viewerId, sourceNode);

  const monitor = document.createElement("audio");
  monitor.autoplay = true;
  monitor.playsInline = true;
  monitor.srcObject = stream;
  monitor.style.display = "none";
  document.body.append(monitor);
  monitor.play().catch(() => {});
  state.hostMonitors.set(viewerId, monitor);
}

async function handleIceCandidate(from, candidate) {
  const peer = state.peers.get(from);
  if (!peer || !candidate) {
    return;
  }

  try {
    await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (error) {
    console.error("candidate error", error);
  }
}

async function flushPendingViewers() {
  if (!state.isHost || !state.localPrepared || !state.pendingViewers.size) {
    return;
  }

  const viewers = Array.from(state.pendingViewers);
  state.pendingViewers.clear();
  for (const viewerId of viewers) {
    await createOfferForViewer(viewerId);
  }
}

async function ensureViewerMix(viewerId) {
  let mix = state.viewerMixes.get(viewerId);
  if (mix) {
    return mix;
  }

  await ensureHostAudioContext();
  const destination = state.hostAudioContext.createMediaStreamDestination();
  const audioTrack = destination.stream.getAudioTracks()[0];
  mix = {
    viewerId,
    destination,
    audioTrack,
    movieAttached: false,
    hostMicAttached: false,
    remoteIds: new Set(),
  };

  state.viewerMixes.set(viewerId, mix);
  attachMovieSourceToMix(mix);
  attachHostMicToMix(mix);
  attachExistingRemoteSourcesToMix(mix);
  return mix;
}

function attachMovieSourceToMix(mix) {
  if (!state.movieSourceNode || mix.movieAttached) {
    return;
  }
  state.movieSourceNode.connect(mix.destination);
  mix.movieAttached = true;
}

function attachHostMicToMix(mix) {
  if (!state.hostMicSourceNode || mix.hostMicAttached) {
    return;
  }
  state.hostMicSourceNode.connect(mix.destination);
  mix.hostMicAttached = true;
}

function detachHostMicFromMixes() {
  if (!state.hostMicSourceNode) {
    return;
  }
  state.viewerMixes.forEach((mix) => {
    if (!mix.hostMicAttached) {
      return;
    }
    try {
      state.hostMicSourceNode.disconnect(mix.destination);
    } catch (error) {
      console.warn(error);
    }
    mix.hostMicAttached = false;
  });
}

function attachExistingRemoteSourcesToMix(mix) {
  state.remoteSources.forEach((sourceNode, remoteId) => {
    if (remoteId === mix.viewerId || mix.remoteIds.has(remoteId)) {
      return;
    }
    sourceNode.connect(mix.destination);
    mix.remoteIds.add(remoteId);
  });
}

function attachRemoteSourceToEligibleMixes(remoteId, sourceNode) {
  state.viewerMixes.forEach((mix) => {
    if (mix.viewerId === remoteId || mix.remoteIds.has(remoteId)) {
      return;
    }
    sourceNode.connect(mix.destination);
    mix.remoteIds.add(remoteId);
  });
}

function removeRemoteSource(remoteId) {
  const sourceNode = state.remoteSources.get(remoteId);
  if (sourceNode) {
    try {
      sourceNode.disconnect();
    } catch (error) {
      console.warn(error);
    }
  }
  state.remoteSources.delete(remoteId);

  state.viewerMixes.forEach((mix) => {
    mix.remoteIds.delete(remoteId);
  });

  const monitor = state.hostMonitors.get(remoteId);
  if (monitor) {
    monitor.pause();
    monitor.srcObject = null;
    monitor.remove();
  }
  state.hostMonitors.delete(remoteId);
}

function cleanupPeer(peerId) {
  const peer = state.peers.get(peerId);
  if (!peer) {
    return;
  }

  try {
    peer.pc.onicecandidate = null;
    peer.pc.ontrack = null;
    peer.pc.close();
  } catch (error) {
    console.warn(error);
  }

  if (peer.role === "host") {
    const mix = state.viewerMixes.get(peerId);
    if (mix) {
      state.viewerMixes.delete(peerId);
    }
    removeRemoteSource(peerId);
  }

  if (peer.role === "viewer") {
    state.viewerMicSender = null;
    if (!isStorageMode()) {
      state.viewerRemoteStream = null;
      dom.remoteVideo.pause();
      dom.remoteVideo.srcObject = null;
    }
    dom.remoteAudio.pause();
    dom.remoteAudio.srcObject = null;
    stopViewerCanvasLoop();
  }

  state.peers.delete(peerId);
  updateWaitingOverlay();
}

function closeAllPeers() {
  Array.from(state.peers.keys()).forEach((peerId) => cleanupPeer(peerId));
  state.viewerMixes.clear();
}

function startViewerCanvasLoop() {
  if (state.isHost) {
    return;
  }

  if (state.viewerLoopFrame) {
    cancelAnimationFrame(state.viewerLoopFrame);
  }

  const context = dom.viewerCanvas.getContext("2d");
  const draw = () => {
    const width = dom.mediaShell.clientWidth;
    const height = dom.mediaShell.clientHeight;
    const ratio = window.devicePixelRatio || 1;
    const nextWidth = Math.max(1, Math.floor(width * ratio));
    const nextHeight = Math.max(1, Math.floor(height * ratio));

    if (dom.viewerCanvas.width !== nextWidth || dom.viewerCanvas.height !== nextHeight) {
      dom.viewerCanvas.width = nextWidth;
      dom.viewerCanvas.height = nextHeight;
    }

    context.fillStyle = "#02060b";
    context.fillRect(0, 0, dom.viewerCanvas.width, dom.viewerCanvas.height);

    if (dom.remoteVideo.readyState >= 2 && dom.remoteVideo.videoWidth > 0) {
      drawVideoContain(context, dom.remoteVideo, dom.viewerCanvas.width, dom.viewerCanvas.height);
    } else {
      context.clearRect(0, 0, dom.viewerCanvas.width, dom.viewerCanvas.height);
    }

    state.viewerLoopFrame = requestAnimationFrame(draw);
  };

  draw();
}

function drawVideoContain(context, video, canvasWidth, canvasHeight) {
  const videoWidth = video.videoWidth || canvasWidth;
  const videoHeight = video.videoHeight || canvasHeight;
  const videoRatio = videoWidth / videoHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth = canvasWidth;
  let drawHeight = canvasHeight;
  if (videoRatio > canvasRatio) {
    drawHeight = canvasWidth / videoRatio;
  } else {
    drawWidth = canvasHeight * videoRatio;
  }

  const drawX = (canvasWidth - drawWidth) / 2;
  const drawY = (canvasHeight - drawHeight) / 2;
  context.drawImage(video, drawX, drawY, drawWidth, drawHeight);
}

function stopViewerCanvasLoop() {
  if (state.viewerLoopFrame) {
    cancelAnimationFrame(state.viewerLoopFrame);
    state.viewerLoopFrame = null;
  }
}

function toggleViewerControls() {
  if (state.isHost) {
    return;
  }
  const visible = !dom.viewerControls.classList.contains("hidden");
  if (visible) {
    dom.viewerControls.classList.add("hidden");
    clearTimeout(state.viewerControlsTimer);
  } else {
    revealViewerControls();
  }
}

function shouldAttemptViewerPlaybackOnTap() {
  if (state.isHost) {
    return false;
  }

  if (!dom.playUnlockOverlay.classList.contains("hidden")) {
    return true;
  }

  if (!isStorageMode()) {
    return false;
  }

  return Boolean(state.roomData?.sync?.isPlaying && dom.remoteVideo.paused);
}

function revealViewerControls() {
  if (state.isHost) {
    return;
  }
  updateViewerPlaybackUi();
  dom.viewerControls.classList.remove("hidden");
  clearTimeout(state.viewerControlsTimer);
  if (state.roomData?.sync?.isPlaying) {
    state.viewerControlsTimer = window.setTimeout(() => {
      dom.viewerControls.classList.add("hidden");
    }, 3200);
  }
}

function hideHostControls() {
  dom.hostControlsOverlay.classList.add("hidden");
  clearTimeout(state.hostControlsTimer);
}

function toggleHostControls() {
  if (!state.isHost || !state.localPrepared || state.screen !== "room") {
    return;
  }
  const visible = !dom.hostControlsOverlay.classList.contains("hidden");
  if (visible) {
    hideHostControls();
    return;
  }
  revealHostControls();
}

function revealHostControls() {
  if (!state.isHost || !state.localPrepared || state.screen !== "room") {
    return;
  }
  dom.hostControlsOverlay.classList.remove("hidden");
  clearTimeout(state.hostControlsTimer);
  state.hostControlsTimer = window.setTimeout(() => {
    dom.hostControlsOverlay.classList.add("hidden");
  }, 3200);
}

function focusChatComposer() {
  const hadExpandedPlayer = !!document.fullscreenElement || document.body.classList.contains("theater-mode");
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
  setTheaterMode(false);
  if (hadExpandedPlayer) {
    dom.chatSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  dom.chatInput.focus();
  revealViewerControls();
}

async function toggleViewerFullscreen() {
  await toggleMediaFullscreen();
  if (!state.isHost) {
    revealViewerControls();
  }
}

async function toggleMediaFullscreen() {
  if (document.fullscreenElement) {
    await document.exitFullscreen().catch(() => {});
    unlockLandscapeMode();
    syncViewerExpandState();
    return;
  }

  if (document.body.classList.contains("theater-mode")) {
    setTheaterMode(false);
    unlockLandscapeMode();
    revealViewerControls();
    return;
  }

  if (typeof dom.mediaShell.requestFullscreen === "function") {
    try {
      await dom.mediaShell.requestFullscreen({ navigationUI: "hide" });
      await lockLandscapeMode();
    } catch (error) {
      setTheaterMode(true);
      await lockLandscapeMode();
    }
  } else {
    setTheaterMode(true);
    await lockLandscapeMode();
  }

  syncViewerExpandState();
}

function setTheaterMode(enabled) {
  document.body.classList.toggle("theater-mode", enabled && state.screen === "room");
  if (!enabled) {
    dom.theaterChatOverlay.innerHTML = "";
  }
  syncViewerExpandState();
}

function handleFullscreenChange() {
  if (!document.fullscreenElement && !document.body.classList.contains("theater-mode")) {
    unlockLandscapeMode();
    dom.theaterChatOverlay.innerHTML = "";
  }
  syncViewerExpandState();
}

async function lockLandscapeMode() {
  if (!screen.orientation?.lock) {
    return;
  }
  await screen.orientation.lock("landscape").catch(() => {});
}

function unlockLandscapeMode() {
  screen.orientation?.unlock?.();
}

function syncViewerExpandState() {
  const expanded = isExpandedPlayer();
  dom.viewerFullscreenButton.innerHTML = expanded ? ICONS.collapse : ICONS.expand;
  dom.viewerFullscreenButton.setAttribute("aria-label", expanded ? "تصغير الشاشة" : "تكبير الشاشة");
  dom.hostFullscreenButton.innerHTML = expanded ? ICONS.collapse : ICONS.expand;
  dom.hostFullscreenButton.setAttribute("aria-label", expanded ? "تصغير الشاشة" : "تكبير الشاشة");
}

function isExpandedPlayer() {
  return !!document.fullscreenElement || document.body.classList.contains("theater-mode");
}

async function attemptRemotePlayback(options = {}) {
  const force = Boolean(options.force);

  if (isYoutubeMode()) {
    await applyYoutubeSync(state.roomData?.sync, force);
    dom.playUnlockOverlay.classList.add("hidden");
    return;
  }

  if (isStorageMode()) {
    await applyStorageSync(state.roomData?.sync, force);
    return;
  }

  if (!dom.remoteVideo.srcObject && !dom.remoteAudio.srcObject) {
    return;
  }

  let videoStarted = !dom.remoteVideo.srcObject;
  if (dom.remoteVideo.srcObject) {
    videoStarted = await dom.remoteVideo.play().then(
      () => true,
      () => false
    );
  }

  if (dom.remoteAudio.srcObject) {
    await dom.remoteAudio.play().catch(() => {});
  }

  if (videoStarted) {
    dom.playUnlockOverlay.classList.add("hidden");
  } else {
    dom.playUnlockOverlay.classList.remove("hidden");
  }
}

function scheduleViewerReconnect(delay = 600) {
  if (state.isHost || !state.roomData?.creatorId) {
    return;
  }

  const creatorOnline = state.members.has(state.roomData.creatorId);
  const roomIsLive = state.roomData?.status === "live";
  const hasPeer = state.peers.has(state.roomData.creatorId);

  if (!creatorOnline || !roomIsLive || hasPeer) {
    return;
  }

  const now = Date.now();
  if (now - state.lastViewerReadyAt < 1800) {
    return;
  }

  cleanupViewerReconnect();
  state.viewerReconnectTimer = window.setTimeout(() => {
    state.lastViewerReadyAt = Date.now();
    sendSignal(state.roomData.creatorId, { type: "viewer-ready" }).catch((error) =>
      console.error("viewer-ready error", error)
    );
  }, delay);
}

function cleanupViewerReconnect() {
  if (state.viewerReconnectTimer) {
    clearTimeout(state.viewerReconnectTimer);
    state.viewerReconnectTimer = null;
  }
}

function showToast(message) {
  clearTimeout(state.toastTimer);
  dom.toast.textContent = message;
  dom.toast.classList.remove("hidden");
  state.toastTimer = window.setTimeout(() => {
    dom.toast.classList.add("hidden");
  }, 3200);
}

function getFriendlyErrorMessage(error) {
  const raw = String(error?.message || error || "");
  if (/permission denied/i.test(raw)) {
    return "فايربيس رفض العملية. فعّل قواعد Realtime Database و Storage المرفقة ثم أعد المحاولة.";
  }
  return raw || "حدث خطأ غير متوقع.";
}

function restorePrettyRoute() {
  const pendingRoute = readStorageValue(sessionStorage, ROUTE_STORAGE_KEY);
  if (!pendingRoute) {
    return;
  }

  const current = location.pathname + location.search + location.hash;
  if (pendingRoute !== current) {
    history.replaceState({}, "", pendingRoute);
  }
  removeStorageValue(sessionStorage, ROUTE_STORAGE_KEY);
}

function getRoomIdFromLocation() {
  const queryRoom = normalizeRoomCodeInput(new URLSearchParams(location.search).get("room"));
  if (queryRoom && /^\d{4}$/.test(queryRoom)) {
    return queryRoom;
  }

  const segments = location.pathname.split("/").filter(Boolean);
  const last = normalizeRoomCodeInput(segments.at(-1));
  return /^\d{4}$/.test(last || "") ? last : null;
}

function getBasePath() {
  const segments = location.pathname.split("/").filter(Boolean);
  const last = segments.at(-1);
  const baseSegments = /^\d{4}$/.test(normalizeRoomCodeInput(last) || "")
    ? segments.slice(0, -1)
    : segments;
  const basePath = `/${baseSegments.join("/")}`;
  return basePath === "/" ? "/" : `${basePath}/`;
}

function buildShareUrl(roomId) {
  return `${location.origin}${getBasePath()}${roomId}`;
}

function buildRoomUrl(roomId) {
  return `${getBasePath()}${roomId}`;
}

function navigateHome() {
  history.replaceState({}, "", getBasePath());
  state.routeRoomId = null;
  dom.displayNameInput.value = state.name;
  hideHostControls();
  updateHomeMode();
  switchScreen("home");
}

async function generateUniqueRoomId() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const roomId = `${Math.floor(1000 + Math.random() * 9000)}`;
    const snapshot = await get(ref(db, `rooms/${roomId}`));
    if (!snapshot.exists()) {
      return roomId;
    }
  }
  throw new Error("تعذر إنشاء رقم غرفة جديد الآن. حاول مرة أخرى.");
}

function sanitizeName(value) {
  return (value || "").trim().replace(/\s+/g, " ").slice(0, 28);
}

function sanitizeLibraryName(value) {
  return (value || "").trim().replace(/\s+/g, " ").slice(0, 80);
}

function normalizeRoomCodeInput(value) {
  return normalizeDigits(value).replace(/\D/g, "").slice(0, 4);
}

function normalizeDigits(value) {
  return String(value || "")
    .replace(/[٠-٩]/g, (digit) => `${digit.charCodeAt(0) - 0x0660}`)
    .replace(/[۰-۹]/g, (digit) => `${digit.charCodeAt(0) - 0x06f0}`);
}

function truncateReplyText(value) {
  const text = (value || "").trim().replace(/\s+/g, " ");
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}

function extractYoutubeId(value) {
  const raw = (value || "").trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) {
    return raw;
  }

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      return normalizeYoutubeId(url.pathname.split("/").filter(Boolean)[0]);
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      const watchId = normalizeYoutubeId(url.searchParams.get("v"));
      if (watchId) {
        return watchId;
      }
      const parts = url.pathname.split("/").filter(Boolean);
      const markerIndex = parts.findIndex((part) => ["embed", "shorts", "live"].includes(part));
      return normalizeYoutubeId(markerIndex >= 0 ? parts[markerIndex + 1] : "");
    }
  } catch (error) {
    return "";
  }

  return "";
}

function normalizeYoutubeId(value) {
  const id = (value || "").trim();
  return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : "";
}

function sanitizeStorageFileName(value) {
  const fallback = "movie.mp4";
  const cleaned = String(value || fallback)
    .trim()
    .replace(/[\\/:*?"<>|#%{}^~[\]`]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
  return cleaned || fallback;
}

function buildYoutubeWatchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function syncRenameSaveVisibility() {
  const nextName = sanitizeName(dom.renameInput?.value || "");
  dom.renameSaveButton.classList.toggle("hidden", !nextName || nextName === state.name);
}

function createClientId() {
  return crypto.randomUUID ? crypto.randomUUID() : `member-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createLibraryItemId() {
  const randomPart = crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `lib-${randomPart}`.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 80);
}

function createAvatar(seed, name) {
  const hash = hashString(`${seed}:${name}`) >>> 0;
  const palettes = [
    ["#07101d", "#12355d", "#d6b56a", "#fff4cf"],
    ["#10243f", "#2f6f9f", "#f0d895", "#f8f1df"],
    ["#1b263b", "#415a77", "#e0b15c", "#fff2cc"],
    ["#081c15", "#2d6a4f", "#95d5b2", "#f8f1df"],
    ["#240046", "#7b2cbf", "#ffb703", "#fff3bf"],
    ["#001d3d", "#005f73", "#ffc300", "#f8f1df"],
    ["#14213d", "#bc6c25", "#fca311", "#fff0c1"],
    ["#0f172a", "#2563eb", "#93c5fd", "#eff6ff"],
    ["#2b2d42", "#8d99ae", "#ef233c", "#edf2f4"],
    ["#3a0ca3", "#f72585", "#4cc9f0", "#ffe8f3"],
    ["#0b132b", "#5bc0be", "#f4d35e", "#f8f1df"],
    ["#22333b", "#c6ac8f", "#eae0d5", "#fffaf0"],
  ];
  const [start, end, accent, letterColor] = palettes[hash % palettes.length];
  const letter = getLatinAvatarLetter(name);
  const ringStyle = hash % 4;
  const ornamentStyle = (hash >>> 3) % 5;
  const fontWeight = 700 + ((hash >>> 7) % 2) * 100;
  const tilt = ((hash >>> 5) % 9) - 4;
  const letterSize = 56 + ((hash >>> 9) % 7);
  const glowOpacity = 0.16 + ((hash >>> 11) % 8) / 100;
  const ringMarkup = getLetterAvatarRing(ringStyle, accent);
  const ornamentMarkup = getLetterAvatarOrnament(ornamentStyle, accent, letterColor, hash);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="g" x1="${hash % 2 ? "0%" : "100%"}" x2="${hash % 2 ? "100%" : "0%"}" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${start}" />
          <stop offset="100%" stop-color="${end}" />
        </linearGradient>
        <radialGradient id="shine" cx="34%" cy="24%" r="70%">
          <stop offset="0%" stop-color="#fff" stop-opacity=".28" />
          <stop offset="45%" stop-color="#fff" stop-opacity=".06" />
          <stop offset="100%" stop-color="#fff" stop-opacity="0" />
        </radialGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="7" stdDeviation="6" flood-color="#000" flood-opacity=".34"/>
        </filter>
        <filter id="letterGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="${accent}" flood-opacity="${glowOpacity}"/>
        </filter>
      </defs>
      <rect width="120" height="120" rx="60" fill="url(#g)" />
      <rect width="120" height="120" rx="60" fill="url(#shine)" />
      <circle cx="${24 + (hash % 18)}" cy="${22 + ((hash >>> 4) % 16)}" r="${13 + ((hash >>> 8) % 9)}" fill="#fff" opacity=".08" />
      <circle cx="${86 - ((hash >>> 12) % 14)}" cy="${88 - ((hash >>> 16) % 12)}" r="${18 + ((hash >>> 18) % 10)}" fill="#fff" opacity=".06" />
      <path d="M18 91c23 18 60 22 88-5" fill="none" stroke="${accent}" stroke-width="1.4" stroke-linecap="round" opacity=".28" />
      ${ringMarkup}
      ${ornamentMarkup}
      <g transform="rotate(${tilt} 60 62)" filter="url(#letterGlow)">
        <text x="60" y="66" text-anchor="middle" dominant-baseline="middle"
          fill="${letterColor}" stroke="rgba(4,9,16,.28)" stroke-width="1.4"
          paint-order="stroke fill" font-family="Changa, Tajawal, serif"
          font-size="${letterSize}" font-weight="${fontWeight}" letter-spacing="-.04em">${escapeXml(letter)}</text>
        <path d="M41 84c12 6 27 6 39 0" fill="none" stroke="${accent}" stroke-width="3" stroke-linecap="round" opacity=".72" />
      </g>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function getLatinAvatarLetter(name) {
  const first = Array.from(sanitizeName(name)).find((char) => /[\p{L}\p{N}]/u.test(char)) || "C";
  const upper = first.toLocaleUpperCase("en-US");
  if (/^[A-Z0-9]$/.test(upper)) {
    return upper;
  }

  const arabicMap = {
    "ا": "A",
    "أ": "A",
    "إ": "E",
    "آ": "A",
    "ٱ": "A",
    "ع": "A",
    "ء": "A",
    "ب": "B",
    "پ": "B",
    "ت": "T",
    "ث": "T",
    "ج": "J",
    "چ": "J",
    "ح": "H",
    "خ": "K",
    "د": "D",
    "ذ": "D",
    "ر": "R",
    "ز": "Z",
    "س": "S",
    "ش": "S",
    "ص": "S",
    "ض": "D",
    "ط": "T",
    "ظ": "Z",
    "غ": "G",
    "ف": "F",
    "ڤ": "V",
    "ق": "Q",
    "ك": "K",
    "ک": "K",
    "گ": "G",
    "ل": "L",
    "م": "M",
    "ن": "N",
    "ه": "H",
    "ة": "H",
    "و": "W",
    "ؤ": "W",
    "ي": "Y",
    "ى": "Y",
    "ئ": "Y",
  };

  return arabicMap[first] || arabicMap[upper] || "C";
}

function getLetterAvatarRing(style, accent) {
  const opacity = style % 2 ? ".42" : ".28";
  const dash = style === 0 ? "" : style === 1 ? 'stroke-dasharray="4 6"' : style === 2 ? 'stroke-dasharray="1 7"' : 'stroke-dasharray="18 8"';
  return `
    <circle cx="60" cy="60" r="49" fill="none" stroke="${accent}" stroke-width="2.3" opacity="${opacity}" ${dash} />
    <circle cx="60" cy="60" r="40" fill="rgba(4,9,16,.14)" stroke="#fff" stroke-width="1" opacity=".16" />
  `;
}

function getLetterAvatarOrnament(style, accent, letterColor, hash) {
  const rotate = (hash % 24) - 12;
  const opacity = ".72";
  const ornaments = [
    `<g transform="translate(83 24) rotate(${rotate})" opacity="${opacity}">
      <rect x="0" y="5" width="24" height="15" rx="4" fill="${accent}"/>
      <circle cx="5" cy="9" r="1.5" fill="${letterColor}" opacity=".72"/>
      <circle cx="12" cy="9" r="1.5" fill="${letterColor}" opacity=".72"/>
      <circle cx="19" cy="9" r="1.5" fill="${letterColor}" opacity=".72"/>
      <path d="M17 8l8-5v19l-8-5V8Z" fill="${letterColor}" opacity=".34"/>
    </g>`,
    `<g transform="translate(18 22) rotate(${rotate})" fill="${accent}" opacity="${opacity}">
      <path d="M10 0l3.2 7 7.6.9-5.6 5.1 1.5 7.5L10 16.8l-6.7 3.7L4.8 13-.8 7.9 6.8 7 10 0Z"/>
      <circle cx="28" cy="26" r="3" fill="${letterColor}" opacity=".58"/>
    </g>`,
    `<g transform="translate(84 82) rotate(${rotate})" fill="none" stroke="${accent}" stroke-width="3" stroke-linecap="round" opacity="${opacity}">
      <path d="M0 12c9-16 22-16 31 0"/>
      <path d="M3 18c8-8 17-8 25 0"/>
    </g>`,
    `<g transform="translate(18 83) rotate(${rotate})" opacity="${opacity}">
      <rect x="0" y="0" width="29" height="18" rx="4" fill="${accent}"/>
      <circle cx="9" cy="9" r="4" fill="${letterColor}" opacity=".42"/>
      <path d="M19 6h8M19 12h6" stroke="${letterColor}" stroke-width="2" stroke-linecap="round" opacity=".68"/>
    </g>`,
    `<g transform="translate(86 20) rotate(${rotate})" fill="${accent}" opacity="${opacity}">
      <path d="M8 0c1 7 5 11 12 12-7 1-11 5-12 12C7 17 3 13-4 12 3 11 7 7 8 0Z"/>
      <circle cx="-58" cy="20" r="3" fill="${letterColor}" opacity=".54"/>
      <circle cx="-46" cy="68" r="2" fill="${letterColor}" opacity=".44"/>
    </g>`,
  ];
  return ornaments[style] || ornaments[0];
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatYoutubeDuration(value) {
  const match = String(value || "").match(
    /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/
  );
  if (!match) {
    return "";
  }

  const [, days = "0", hours = "0", minutes = "0", seconds = "0"] = match;
  const totalSeconds =
    Number(days) * 86400 + Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
  return totalSeconds > 0 ? formatDuration(totalSeconds) : "";
}

function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = seconds % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

function formatClock(timestamp) {
  return new Date(timestamp || Date.now()).toLocaleTimeString("ar-KW-u-nu-latn", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** power;
  return `${value.toFixed(value >= 10 || power === 0 ? 0 : 1)} ${units[power]}`;
}

function roundTime(value) {
  return Number((value || 0).toFixed(2));
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function waitForVideoReady(video, eventName) {
  if (eventName === "loadedmetadata" && video.readyState >= 1) {
    return Promise.resolve();
  }
  if (eventName === "canplay" && video.readyState >= 3) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("تعذر قراءة ملف الفيلم."));
    };
    const cleanup = () => {
      video.removeEventListener(eventName, onReady);
      video.removeEventListener("error", onError);
    };

    video.addEventListener(eventName, onReady, { once: true });
    video.addEventListener("error", onError, { once: true });
  });
}

async function waitForPlayable(video) {
  if (video.readyState >= 3) {
    return;
  }
  await waitForVideoReady(video, "canplay");
}

function waitForSeekCompletion(video, timeout = 4500) {
  if (!video.seeking && video.readyState >= 2) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const timer = window.setTimeout(cleanup, timeout);
    const onReady = () => cleanup();
    const cleanup = () => {
      clearTimeout(timer);
      video.removeEventListener("seeked", onReady);
      video.removeEventListener("canplay", onReady);
      resolve();
    };

    video.addEventListener("seeked", onReady, { once: true });
    video.addEventListener("canplay", onReady, { once: true });
  });
}

function openHostMediaDb() {
  if (!("indexedDB" in window)) {
    return Promise.reject(new Error("indexedDB unavailable"));
  }

  if (hostMediaDbPromise) {
    return hostMediaDbPromise;
  }

  hostMediaDbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(HOST_MEDIA_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(HOST_MEDIA_STORE_NAME)) {
        database.createObjectStore(HOST_MEDIA_STORE_NAME, { keyPath: "roomId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("failed to open indexedDB"));
  });

  return hostMediaDbPromise;
}

async function persistHostMovie(roomId, file) {
  if (!roomId || !file) {
    return;
  }

  const database = await openHostMediaDb();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(HOST_MEDIA_STORE_NAME, "readwrite");
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("failed to persist host movie"));
    transaction.objectStore(HOST_MEDIA_STORE_NAME).put({
      roomId,
      blob: file,
      name: file.name,
      size: file.size,
      type: file.type,
      savedAt: Date.now(),
    });
  });
}

async function getPersistedHostMovie(roomId) {
  if (!roomId || !("indexedDB" in window)) {
    return null;
  }

  const database = await openHostMediaDb();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(HOST_MEDIA_STORE_NAME, "readonly");
    const request = transaction.objectStore(HOST_MEDIA_STORE_NAME).get(roomId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error("failed to read host movie"));
  });
}

async function clearPersistedHostMovie(roomId) {
  if (!roomId || !("indexedDB" in window)) {
    return;
  }

  const database = await openHostMediaDb();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(HOST_MEDIA_STORE_NAME, "readwrite");
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("failed to clear host movie"));
    transaction.objectStore(HOST_MEDIA_STORE_NAME).delete(roomId);
  });
}

function loadPreferredName() {
  return readStorageValue(localStorage, NAME_STORAGE_KEY) || readStorageValue(sessionStorage, NAME_STORAGE_KEY) || "";
}

function savePreferredName(name) {
  writeStorageValue(localStorage, NAME_STORAGE_KEY, name);
  writeStorageValue(sessionStorage, NAME_STORAGE_KEY, name);
}

function getStoredSessions() {
  const localSessions = parseStoredSessions(readStorageValue(localStorage, SESSION_STORAGE_KEY));
  const tabSessions = parseStoredSessions(readStorageValue(sessionStorage, SESSION_STORAGE_KEY));
  const sessions = {
    ...tabSessions,
    ...localSessions,
  };

  if (Object.keys(sessions).length) {
    const serialized = JSON.stringify(sessions);
    writeStorageValue(localStorage, SESSION_STORAGE_KEY, serialized);
    writeStorageValue(sessionStorage, SESSION_STORAGE_KEY, serialized);
  }

  return sessions;
}

function parseStoredSessions(value) {
  if (!value) {
    return {};
  }
  try {
    return JSON.parse(value) || {};
  } catch (error) {
    return {};
  }
}

function getViewerStartGestures() {
  return {
    ...parseStoredSessions(readStorageValue(sessionStorage, VIEWER_START_STORAGE_KEY)),
    ...parseStoredSessions(readStorageValue(localStorage, VIEWER_START_STORAGE_KEY)),
  };
}

function hasViewerStartGesture(roomId) {
  if (!roomId) {
    return false;
  }
  return Boolean(getViewerStartGestures()[roomId]);
}

function markViewerStartGesture(roomId) {
  if (!roomId) {
    return;
  }

  const gestures = getViewerStartGestures();
  gestures[roomId] = Date.now();

  const roomIds = Object.keys(gestures).sort((first, second) => (gestures[second] || 0) - (gestures[first] || 0));
  const compactGestures = {};
  roomIds.slice(0, 80).forEach((id) => {
    compactGestures[id] = gestures[id];
  });

  const serialized = JSON.stringify(compactGestures);
  writeStorageValue(localStorage, VIEWER_START_STORAGE_KEY, serialized);
  writeStorageValue(sessionStorage, VIEWER_START_STORAGE_KEY, serialized);
}

function clearViewerStartGesture(roomId) {
  if (!roomId) {
    return;
  }

  const gestures = getViewerStartGestures();
  delete gestures[roomId];
  const serialized = JSON.stringify(gestures);
  writeStorageValue(localStorage, VIEWER_START_STORAGE_KEY, serialized);
  writeStorageValue(sessionStorage, VIEWER_START_STORAGE_KEY, serialized);
}

function getRoomSession(roomId) {
  const sessions = getStoredSessions();
  return sessions[roomId] || null;
}

function recoverRouteSession(roomId) {
  const name = sanitizeName(state.name);
  if (!roomId || !name) {
    return null;
  }

  const memberId = createClientId();
  const session = {
    roomId,
    memberId,
    isHost: false,
    name,
    avatar: createAvatar(memberId, name),
  };

  saveRoomSession(session);
  return session;
}

function getActiveRoomId() {
  return (
    readStorageValue(localStorage, ACTIVE_ROOM_STORAGE_KEY) ||
    readStorageValue(sessionStorage, ACTIVE_ROOM_STORAGE_KEY) ||
    ""
  );
}

function setActiveRoomId(roomId) {
  if (!roomId) {
    return;
  }
  writeStorageValue(localStorage, ACTIVE_ROOM_STORAGE_KEY, roomId);
  writeStorageValue(sessionStorage, ACTIVE_ROOM_STORAGE_KEY, roomId);
}

function clearActiveRoomId(roomId = "") {
  if (!roomId || getActiveRoomId() === roomId) {
    removeStorageValue(localStorage, ACTIVE_ROOM_STORAGE_KEY);
    removeStorageValue(sessionStorage, ACTIVE_ROOM_STORAGE_KEY);
  }
}

function getActiveRoomSession() {
  const roomId = getActiveRoomId();
  return roomId ? getRoomSession(roomId) : null;
}

function saveRoomSession(session) {
  const sessions = getStoredSessions();
  sessions[session.roomId] = session;
  const serialized = JSON.stringify(sessions);
  writeStorageValue(localStorage, SESSION_STORAGE_KEY, serialized);
  writeStorageValue(sessionStorage, SESSION_STORAGE_KEY, serialized);
  setActiveRoomId(session.roomId);
}

function clearRoomSession(roomId) {
  if (!roomId) {
    clearActiveRoomId();
    return;
  }
  const sessions = getStoredSessions();
  delete sessions[roomId];
  const serialized = JSON.stringify(sessions);
  writeStorageValue(localStorage, SESSION_STORAGE_KEY, serialized);
  writeStorageValue(sessionStorage, SESSION_STORAGE_KEY, serialized);
  clearViewerStartGesture(roomId);
  clearActiveRoomId(roomId);
}

function readStorageValue(storage, key) {
  try {
    return storage.getItem(key) || "";
  } catch (error) {
    return "";
  }
}

function writeStorageValue(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch (error) {
    console.warn("storage write failed", error);
  }
}

function removeStorageValue(storage, key) {
  try {
    storage.removeItem(key);
  } catch (error) {
    console.warn("storage remove failed", error);
  }
}

function cleanupMediaResources() {
  if (state.idleCleanupTimer) {
    clearInterval(state.idleCleanupTimer);
    state.idleCleanupTimer = null;
  }
  cleanupViewerReconnect();
  stopViewerCanvasLoop();
  stopHostVideoRenderLoop();
  cleanupYouTubePlayer();
  disconnectMovieSource();
  releaseHostWakeLock();
  closeAllPeers();
  clearTimeout(state.viewerControlsTimer);
  clearTimeout(state.hostControlsTimer);
  dom.remoteAudio.pause();
  dom.remoteAudio.srcObject = null;
  state.viewerMicTrack?.stop();
  state.hostMicTrack?.stop();
  if (state.hostCaptureStream) {
    state.hostCaptureStream.getTracks().forEach((track) => track.stop());
  }
}
