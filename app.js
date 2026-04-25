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
const HOST_MEDIA_DB_NAME = "cinema-al-warsha-db";
const HOST_MEDIA_STORE_NAME = "host-media";

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
};

const dom = {
  homeScreen: document.getElementById("homeScreen"),
  uploadScreen: document.getElementById("uploadScreen"),
  roomScreen: document.getElementById("roomScreen"),
  homeHeading: document.getElementById("homeHeading"),
  homeSubtitle: document.getElementById("homeSubtitle"),
  roomCodeHint: document.getElementById("roomCodeHint"),
  identityForm: document.getElementById("identityForm"),
  displayNameInput: document.getElementById("displayNameInput"),
  identitySubmitButton: document.getElementById("identitySubmitButton"),
  movieFileInput: document.getElementById("movieFileInput"),
  uploadStatusCard: document.getElementById("uploadStatusCard"),
  uploadFileName: document.getElementById("uploadFileName"),
  uploadProgressLabel: document.getElementById("uploadProgressLabel"),
  uploadSpeedLabel: document.getElementById("uploadSpeedLabel"),
  uploadProgressBar: document.getElementById("uploadProgressBar"),
  uploadHint: document.getElementById("uploadHint"),
  youtubeForm: document.getElementById("youtubeForm"),
  youtubeUrlInput: document.getElementById("youtubeUrlInput"),
  youtubeSubmitButton: document.getElementById("youtubeSubmitButton"),
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
  focusChatButton: document.getElementById("focusChatButton"),
  viewerFullscreenButton: document.getElementById("viewerFullscreenButton"),
  playUnlockOverlay: document.getElementById("playUnlockOverlay"),
  unlockPlaybackButton: document.getElementById("unlockPlaybackButton"),
  hostControlsOverlay: document.getElementById("hostControlsOverlay"),
  hostMovieName: document.getElementById("hostMovieName"),
  hostTimeLabel: document.getElementById("hostTimeLabel"),
  hostPlayPauseButton: document.getElementById("hostPlayPauseButton"),
  hostFullscreenButton: document.getElementById("hostFullscreenButton"),
  replaceMovieButton: document.getElementById("replaceMovieButton"),
  hostSeekBar: document.getElementById("hostSeekBar"),
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
  confirmModal: document.getElementById("confirmModal"),
  confirmTitle: document.getElementById("confirmTitle"),
  confirmMessage: document.getElementById("confirmMessage"),
  confirmCancelButton: document.getElementById("confirmCancelButton"),
  confirmApproveButton: document.getElementById("confirmApproveButton"),
  toast: document.getElementById("toast"),
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);
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
  viewerReconnectTimer: null,
  viewerMicTrack: null,
  viewerMicSender: null,
  viewerSilentTrack: null,
  viewerAudioContext: null,
  hostAudioContext: null,
  hostCaptureStream: null,
  hostVideoTrack: null,
  hostVideoRenderLoop: null,
  wakeLock: null,
  youtubeApiPromise: null,
  youtubePlayer: null,
  youtubePlayerReadyPromise: null,
  youtubePlayerReadyResolver: null,
  youtubeVideoId: "",
  youtubeSyncTimer: null,
  youtubeApplyingSync: false,
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
  },
};

restorePrettyRoute();
attachEvents();
boot().catch((error) => {
  console.error(error);
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
  dom.movieFileInput.addEventListener("change", handleMovieFileChange);
  dom.youtubeForm.addEventListener("submit", handleYoutubeSubmit);
  dom.hostMenuButton.addEventListener("click", toggleHostMenu);
  dom.copyRoomLinkButton.addEventListener("click", copyRoomLink);
  dom.profileButton.addEventListener("click", openDrawer);
  dom.closeDrawerButton.addEventListener("click", closeDrawer);
  dom.renameForm.addEventListener("submit", handleRenameSubmit);
  dom.renameInput.addEventListener("input", syncRenameSaveVisibility);
  dom.leaveRoomButton.addEventListener("click", handleLeaveRoom);
  dom.cancelReplyButton.addEventListener("click", cancelReply);
  dom.chatForm.addEventListener("submit", handleSendMessage);
  dom.micToggleButton.addEventListener("click", handleMicToggle);
  dom.viewerFullscreenButton.addEventListener("click", toggleViewerFullscreen);
  dom.focusChatButton.addEventListener("click", focusChatComposer);
  dom.unlockPlaybackButton.addEventListener("click", attemptRemotePlayback);
  dom.replaceMovieButton.addEventListener("click", () => {
    revealHostControls();
    dom.movieFileInput.click();
  });
  dom.hostPlayPauseButton.addEventListener("click", async () => {
    revealHostControls();
    await toggleHostPlayback();
  });
  dom.hostFullscreenButton.addEventListener("click", async () => {
    revealHostControls();
    await toggleMediaFullscreen();
  });
  dom.hostSeekBar.addEventListener("input", () => {
    revealHostControls();
    handleHostSeek();
  });
  document.addEventListener("fullscreenchange", syncViewerExpandState);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  dom.hostVideo.addEventListener("loadedmetadata", () => {
    updateHostPlaybackUi();
    syncHostPlayback(true);
  });
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
    updateHostPlaybackUi();
    syncHostPlayback(true);
    releaseHostWakeLock();
  });
  dom.hostVideo.addEventListener("ended", () => {
    updateHostPlaybackUi();
    syncHostPlayback(true);
    releaseHostWakeLock();
  });

  dom.remoteVideo.addEventListener("loadedmetadata", () => {
    startViewerCanvasLoop();
    attemptRemotePlayback();
    revealViewerControls();
    updateWaitingOverlay();
  });

  dom.mediaShell.addEventListener("click", (event) => {
    if (event.target.closest("button") || event.target.closest("input")) {
      return;
    }
    if (state.isHost) {
      toggleHostControls();
      return;
    }
    attemptRemotePlayback();
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
  });

  window.addEventListener("resize", positionProfileDrawer);

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
      await joinRoom(state.routeRoomId, name, getRoomSession(state.routeRoomId));
    } else {
      await createRoom(name);
    }
  } catch (error) {
    console.error(error);
    showToast(getFriendlyErrorMessage(error));
  }
}

async function createRoom(name) {
  const roomId = await generateUniqueRoomId();
  const memberId = createClientId();
  const avatar = createAvatar(memberId, name);
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
    createdAt: Date.now(),
    status: "preparing",
    film: null,
    sync: {
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      updatedAt: Date.now(),
    },
  });

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
  const memberId = existingSession?.memberId || createClientId();
  const isHost = roomData.creatorId === memberId;
  const name = sanitizeName(existingSession?.name || preferredName);
  const avatar = existingSession?.avatar || createAvatar(memberId, name);

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
    if (state.hostMedia.fileUrl || roomData?.film?.source === "youtube") {
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
    updateWaitingOverlay();
    renderViewerTime(state.roomData.sync);
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
  } else {
    dom.homeHeading.textContent = "اكتب اسمك";
    dom.homeSubtitle.textContent = "";
    dom.identitySubmitButton.textContent = "إنشاء غرفة السينما";
  }
}

function switchScreen(name) {
  state.screen = name;
  dom.homeScreen.classList.toggle("active", name === "home");
  dom.uploadScreen.classList.toggle("active", name === "upload");
  dom.roomScreen.classList.toggle("active", name === "room");
  if (name !== "room") {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setTheaterMode(false);
    dom.viewerControls.classList.add("hidden");
    hideHostControls();
    dom.hostMenuPanel.classList.add("hidden");
    closeDrawer();
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
  dom.hostMenuWrap.classList.toggle("hidden", !state.isHost || state.screen !== "room");
  dom.hostVideo.classList.toggle("hidden", !showHostControls || youtubeMode);
  dom.viewerCanvas.classList.toggle("hidden", state.isHost || youtubeMode);
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
  updateWaitingOverlay();
}

async function handleMovieFileChange(event) {
  const [file] = event.target.files || [];
  if (!file || !state.isHost) {
    return;
  }

  try {
    await prepareHostMovie(file);
  } catch (error) {
    console.error(error);
    showToast(getFriendlyErrorMessage(error));
  } finally {
    dom.movieFileInput.value = "";
  }
}

async function handleYoutubeSubmit(event) {
  event.preventDefault();
  if (!state.isHost) {
    return;
  }

  const url = dom.youtubeUrlInput.value.trim();
  const youtubeId = extractYoutubeId(url);
  if (!youtubeId) {
    showToast("ضع رابط يوتيوب صالح.");
    dom.youtubeUrlInput.focus();
    return;
  }

  try {
    await prepareYoutubeMovie(url, youtubeId);
  } catch (error) {
    console.error(error);
    showToast(getFriendlyErrorMessage(error));
  }
}

async function prepareHostMovie(file) {
  if (!file.type.startsWith("video/") && !/\.(mkv|mp4|mov|webm)$/i.test(file.name)) {
    throw new Error("اختر ملف فيديو صالحاً.");
  }

  cleanupViewerReconnect();
  resetHostMovieState();
  closeAllPeers();

  const startedAt = performance.now();
  setUploadProgress(12, file.name, "اختيار الملف");

  state.hostMedia.source = "file";
  state.hostMedia.file = file;
  state.hostMedia.fileUrl = URL.createObjectURL(file);
  state.hostMedia.name = file.name;
  state.hostMedia.size = file.size;
  state.hostMedia.duration = 0;
  state.localPrepared = false;
  dom.hostVideo.src = state.hostMedia.fileUrl;
  dom.hostVideo.load();

  setUploadProgress(38, file.name, "قراءة الفيلم");
  await waitForVideoReady(dom.hostVideo, "loadedmetadata");
  state.hostMedia.duration = Number.isFinite(dom.hostVideo.duration) ? dom.hostVideo.duration : 0;

  const elapsed = Math.max((performance.now() - startedAt) / 1000, 0.2);
  const speedText = `سرعة التهيئة ${formatBytes(file.size / elapsed)}/ث`;
  setUploadProgress(68, file.name, speedText);

  await waitForPlayable(dom.hostVideo);
  setUploadProgress(86, file.name, "تفعيل البث");

  await primeHostVideo();
  setUploadProgress(94, file.name, "حفظ");
  await persistHostMovie(state.roomId, file).catch((error) => {
    console.warn("persist host movie failed", error);
    showToast("تعذر حفظ الفيلم محلياً بعد الإغلاق.");
  });
  await publishHostMovieState();

  state.localPrepared = true;
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
  state.hostMedia = {
    source: "",
    file: null,
    fileUrl: "",
    name: "",
    size: 0,
    duration: 0,
    youtubeId: "",
    youtubeUrl: "",
  };

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

async function handleRoomMediaUpdate() {
  const film = state.roomData?.film;
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

    if (sync.isPlaying) {
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
}

function getProjectedSyncTime(sync, duration = 0) {
  const baseTime = Number(sync?.currentTime || 0);
  const drift = sync?.isPlaying ? Math.max((Date.now() - (sync.updatedAt || Date.now())) / 1000, 0) : 0;
  const projected = baseTime + drift;
  return duration ? Math.min(projected, Math.max(duration - 0.2, 0)) : projected;
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
  const payload = {
    status: "live",
    film: {
      source: "file",
      name: state.hostMedia.name,
      size: state.hostMedia.size,
      duration: roundTime(state.hostMedia.duration),
      preparedAt: Date.now(),
    },
    sync: {
      currentTime: 0,
      duration: roundTime(state.hostMedia.duration),
      isPlaying: false,
      updatedAt: Date.now(),
    },
  };
  await update(ref(db, `rooms/${state.roomId}`), payload);
}

async function publishYoutubeMovieState() {
  const payload = {
    status: "live",
    film: {
      source: "youtube",
      name: state.hostMedia.name || "YouTube",
      size: 0,
      duration: roundTime(state.hostMedia.duration),
      youtubeId: state.hostMedia.youtubeId,
      url: state.hostMedia.youtubeUrl,
      preparedAt: Date.now(),
    },
    sync: {
      currentTime: 0,
      duration: roundTime(state.hostMedia.duration),
      isPlaying: false,
      updatedAt: Date.now(),
    },
  };
  await update(ref(db, `rooms/${state.roomId}`), payload);
}

function updateHostPlaybackUi() {
  if (isYoutubeMode()) {
    const duration = getYoutubeDuration();
    const currentTime = getYoutubeCurrentTime();
    dom.hostMovieName.textContent = getActiveFilm()?.name || "YouTube";
    dom.hostTimeLabel.textContent = `${formatDuration(currentTime)} / ${formatDuration(duration)}`;
    dom.hostSeekBar.value = duration ? `${(currentTime / duration) * 100}` : "0";
    dom.hostPlayPauseButton.innerHTML = isYoutubePlaying() ? ICONS.pause : ICONS.play;
    dom.hostPlayPauseButton.setAttribute("aria-label", isYoutubePlaying() ? "إيقاف" : "تشغيل");
    return;
  }

  const duration = Number.isFinite(dom.hostVideo.duration) ? dom.hostVideo.duration : state.hostMedia.duration || 0;
  const currentTime = dom.hostVideo.currentTime || 0;
  dom.hostMovieName.textContent = state.hostMedia.name || "الفيلم";
  dom.hostTimeLabel.textContent = `${formatDuration(currentTime)} / ${formatDuration(duration)}`;
  dom.hostSeekBar.value = duration ? `${(currentTime / duration) * 100}` : "0";
  dom.hostPlayPauseButton.innerHTML = dom.hostVideo.paused ? ICONS.play : ICONS.pause;
  dom.hostPlayPauseButton.setAttribute("aria-label", dom.hostVideo.paused ? "تشغيل" : "إيقاف");
}

function handleHostSeek() {
  if (!state.isHost || !state.localPrepared) {
    return;
  }

  if (isYoutubeMode()) {
    const duration = getYoutubeDuration();
    if (!duration || !state.youtubePlayer?.seekTo) {
      return;
    }
    state.youtubePlayer.seekTo((Number(dom.hostSeekBar.value) / 100) * duration, true);
    updateHostPlaybackUi();
    syncHostPlayback(true);
    return;
  }

  const duration = Number.isFinite(dom.hostVideo.duration) ? dom.hostVideo.duration : 0;
  if (!duration) {
    return;
  }
  dom.hostVideo.currentTime = (Number(dom.hostSeekBar.value) / 100) * duration;
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

  if (isYoutubeMode()) {
    return syncYoutubeHostPlayback(force);
  }

  const duration = Number.isFinite(dom.hostVideo.duration) ? dom.hostVideo.duration : state.hostMedia.duration || 0;
  const currentTime = dom.hostVideo.currentTime || 0;
  const payload = {
    currentTime: roundTime(currentTime),
    duration: roundTime(duration),
    isPlaying: !dom.hostVideo.paused && !dom.hostVideo.ended,
    updatedAt: Date.now(),
  };

  const signature = JSON.stringify(payload);
  const now = Date.now();
  if (!force && signature === state.lastSyncSignature && now - state.lastSyncSentAt < 850) {
    return;
  }

  state.lastSyncSignature = signature;
  state.lastSyncSentAt = now;

  update(ref(db, `rooms/${state.roomId}`), {
    status: "live",
    sync: payload,
    film: {
      source: "file",
      name: state.hostMedia.name,
      size: state.hostMedia.size,
      duration: roundTime(duration),
      preparedAt: state.roomData?.film?.preparedAt || Date.now(),
    },
  }).catch((error) => console.error("sync error", error));
}

async function syncYoutubeHostPlayback(force = false) {
  const duration = getYoutubeDuration();
  const currentTime = getYoutubeCurrentTime();
  const payload = {
    currentTime: roundTime(currentTime),
    duration: roundTime(duration),
    isPlaying: isYoutubePlaying(),
    updatedAt: Date.now(),
  };

  const signature = JSON.stringify({ source: "youtube", ...payload });
  const now = Date.now();
  if (!force && signature === state.lastSyncSignature && now - state.lastSyncSentAt < 850) {
    return;
  }

  state.lastSyncSignature = signature;
  state.lastSyncSentAt = now;

  update(ref(db, `rooms/${state.roomId}`), {
    status: "live",
    sync: payload,
    film: {
      source: "youtube",
      name: getActiveFilm()?.name || state.hostMedia.name || "YouTube",
      size: 0,
      duration: roundTime(duration),
      youtubeId: getActiveFilm()?.youtubeId || state.hostMedia.youtubeId,
      url: state.hostMedia.youtubeUrl || getActiveFilm()?.url || "",
      preparedAt: state.roomData?.film?.preparedAt || Date.now(),
    },
  }).catch((error) => console.error("youtube sync error", error));
}

function renderViewerTime(sync = null) {
  const currentTime = sync?.currentTime || 0;
  const duration = sync?.duration || 0;
  dom.viewerCurrentTime.textContent = formatDuration(currentTime);
  dom.viewerRemainingTime.textContent = `- ${formatDuration(Math.max(duration - currentTime, 0))}`;
}

function updateWaitingOverlay() {
  const creatorOnline = !!state.roomData?.creatorId && state.members.has(state.roomData.creatorId);
  const roomIsLive = state.roomData?.status === "live";
  const youtubeMode = isYoutubeMode();

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
}

function renderSystemMessage(text) {
  const item = document.createElement("div");
  item.className = "system-message";
  item.textContent = text;
  dom.messagesList.append(item);
  dom.messagesList.scrollTop = dom.messagesList.scrollHeight;
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
    mic.textContent = "🎤";

    item.append(avatar, textWrap, mic);
    dom.participantsList.append(item);
  });
}

function updateViewerCount() {
  const count = state.members.size || (state.roomId ? 1 : 0);
  dom.viewerCountValue.textContent = `${count}`;
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

async function handleRenameSubmit(event) {
  event.preventDefault();
  const nextName = sanitizeName(dom.renameInput.value);
  if (!nextName) {
    showToast("الاسم لا يمكن أن يكون فارغاً.");
    return;
  }

  state.name = nextName;
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
  if (!state.localPrepared || (!state.hostVideoTrack && !isYoutubeMode())) {
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
    return;
  }

  parameters.degradationPreference = "maintain-framerate";
  parameters.encodings[0].maxBitrate = 5_000_000;
  parameters.encodings[0].maxFramerate = 30;

  await sender.setParameters(parameters).catch((error) => {
    console.warn("video sender tuning failed", error);
  });
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
  startViewerCanvasLoop();
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
    state.viewerRemoteStream = null;
    dom.remoteVideo.pause();
    dom.remoteVideo.srcObject = null;
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

function revealViewerControls() {
  if (state.isHost) {
    return;
  }
  dom.viewerControls.classList.remove("hidden");
  clearTimeout(state.viewerControlsTimer);
  state.viewerControlsTimer = window.setTimeout(() => {
    dom.viewerControls.classList.add("hidden");
  }, 3200);
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
    syncViewerExpandState();
    return;
  }

  if (document.body.classList.contains("theater-mode")) {
    setTheaterMode(false);
    revealViewerControls();
    return;
  }

  if (typeof dom.mediaShell.requestFullscreen === "function") {
    try {
      await dom.mediaShell.requestFullscreen();
    } catch (error) {
      setTheaterMode(true);
    }
  } else {
    setTheaterMode(true);
  }

  syncViewerExpandState();
}

function setTheaterMode(enabled) {
  document.body.classList.toggle("theater-mode", enabled && state.screen === "room");
  syncViewerExpandState();
}

function syncViewerExpandState() {
  const expanded = !!document.fullscreenElement || document.body.classList.contains("theater-mode");
  dom.viewerFullscreenButton.innerHTML = expanded ? ICONS.collapse : ICONS.expand;
  dom.viewerFullscreenButton.setAttribute("aria-label", expanded ? "تصغير الشاشة" : "تكبير الشاشة");
  dom.hostFullscreenButton.innerHTML = expanded ? ICONS.collapse : ICONS.expand;
  dom.hostFullscreenButton.setAttribute("aria-label", expanded ? "تصغير الشاشة" : "تكبير الشاشة");
}

async function attemptRemotePlayback() {
  if (isYoutubeMode()) {
    await applyYoutubeSync(state.roomData?.sync, true);
    dom.playUnlockOverlay.classList.add("hidden");
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
    return "فايربيس رفض العملية. فعّل قواعد Realtime Database المرفقة أولاً ثم أعد المحاولة.";
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
  const queryRoom = new URLSearchParams(location.search).get("room");
  if (queryRoom && /^\d{4}$/.test(queryRoom)) {
    return queryRoom;
  }

  const segments = location.pathname.split("/").filter(Boolean);
  const last = segments.at(-1);
  return /^\d{4}$/.test(last || "") ? last : null;
}

function getBasePath() {
  const segments = location.pathname.split("/").filter(Boolean);
  const last = segments.at(-1);
  const baseSegments = /^\d{4}$/.test(last || "") ? segments.slice(0, -1) : segments;
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

function syncRenameSaveVisibility() {
  const nextName = sanitizeName(dom.renameInput?.value || "");
  dom.renameSaveButton.classList.toggle("hidden", !nextName || nextName === state.name);
}

function createClientId() {
  return crypto.randomUUID ? crypto.randomUUID() : `member-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createAvatar(seed, name) {
  const pairs = [
    ["#12355d", "#d6b56a"],
    ["#0f2747", "#f2d388"],
    ["#1e4b7a", "#b98937"],
    ["#183053", "#e6c98e"],
    ["#0d1c31", "#cfa353"],
  ];
  const hash = hashString(seed);
  const [start, end] = pairs[Math.abs(hash) % pairs.length];
  const initials = getInitials(name);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="g" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${start}" />
          <stop offset="100%" stop-color="${end}" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="60" fill="url(#g)" />
      <circle cx="60" cy="48" r="24" fill="rgba(255,255,255,0.18)" />
      <path d="M22 101c6-19 21-29 38-29s32 10 38 29" fill="rgba(255,255,255,0.18)" />
      <text x="60" y="72" text-anchor="middle" dominant-baseline="middle" fill="#fff7e3"
        font-family="Tajawal, sans-serif" font-size="34" font-weight="800">${escapeXml(initials)}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function getInitials(name) {
  const parts = sanitizeName(name).split(" ").filter(Boolean).slice(0, 2);
  if (!parts.length) {
    return "C";
  }
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
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
