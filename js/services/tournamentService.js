import { tournamentsList } from '../data/mockData.js';
import { authService } from './authService.js';
import { notificationService } from './notificationService.js';
import { firebaseService } from './firebaseService.js';

// Real tournaments data store (Clean, zero fake dummy tournaments)
const initialTournaments = [];

class TournamentService {
  constructor() {
    const hasStorage = typeof localStorage !== 'undefined';
    const saved = hasStorage ? localStorage.getItem('mobinx_tournaments_data') : null;
    this.tournaments = saved ? JSON.parse(saved) : [];
  }

  getAll() {
    return this.tournaments;
  }

  setAll(tournaments) {
    if (Array.isArray(tournaments)) {
      this.tournaments = tournaments;
      this.save();
    }
  }

  reloadFromStorage() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('mobinx_tournaments_data');
      if (saved) {
        try {
          this.tournaments = JSON.parse(saved);
        } catch (e) {}
      }
    }
  }

  getAll() {
    return this.tournaments.filter(t => t.isActive !== false && t.status !== 'inactive' && t.status !== 'INACTIVE');
  }

  getByStatus(status) {
    const active = this.getAll();
    if (!status || status === 'ALL') return active;
    return active.filter(t => t.status && t.status.toUpperCase() === status.toUpperCase());
  }


  getById(id) {
    return this.tournaments.find(t => t.id === id);
  }

  getParticipants(tournamentId) {
    const tournament = this.getById(tournamentId);
    return (tournament && tournament.participants) || [];
  }

  addTournament(newTourn) {
    const tournObj = {
      id: 'tourn-' + Date.now(),
      status: 'UPCOMING',
      slotsTotal: 48,
      slotsFilled: 0,
      banner: 'assets/images/banner_esports.jpg',
      rules: 'Mobile only (No emulators). Room ID sent 15 mins before start.',
      isRoomReleased: false,
      roomId: '',
      roomPass: '',
      participants: [],
      ...newTourn
    };
    this.tournaments.unshift(tournObj);
    this.save();
    return tournObj;
  }

  updateTournament(id, updates) {
    const index = this.tournaments.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tournaments[index] = { ...this.tournaments[index], ...updates };
      this.save();
      return this.tournaments[index];
    }
    return null;
  }

  deleteTournament(id) {
    const index = this.tournaments.findIndex(t => t.id === id);
    if (index !== -1) {
      const removed = this.tournaments.splice(index, 1)[0];
      this.save();
      return removed;
    }
    return null;
  }

  /**
   * ADMIN ACTION: Release Custom Room ID & Password
   * Automatically updates match status, flags isRoomReleased, and broadcasts push notification
   */
  releaseRoomCredentials(tournamentId, roomId, roomPass) {
    const tournament = this.getById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    const cleanRoomId = (roomId || '').trim();
    const cleanRoomPass = (roomPass || '').trim();

    if (!cleanRoomId || !cleanRoomPass) {
      throw new Error("Please provide both Custom Room ID and Password");
    }

    tournament.roomId = cleanRoomId;
    tournament.roomPass = cleanRoomPass;
    tournament.isRoomReleased = true;
    tournament.status = "ROOM RELEASED";

    this.save();

    // Broadcast instant in-app notification to all players
    notificationService.notifications.unshift({
      id: "notif-room-" + Date.now(),
      type: "tournament",
      title: `⚡ Room Released: ${tournament.title}`,
      desc: `Custom Room ID: ${cleanRoomId} | Password: ${cleanRoomPass}. Open Free Fire and enter custom lobby now!`,
      timeAgo: "Just now",
      unread: true,
      icon: "trophy",
      color: "#ef4444"
    });

    return {
      success: true,
      tournament,
      roomId: cleanRoomId,
      roomPass: cleanRoomPass
    };
  }

  joinTournament(tournamentId, playerData = {}) {
    const tournament = this.getById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");
    if (tournament.slotsFilled >= tournament.slotsTotal) {
      throw new Error("Tournament is full!");
    }
    
    if (!tournament.participants) {
      tournament.participants = [];
    }

    const user = authService.getCurrentUser();
    const ign = playerData.playerName || user.username || "Player";
    const ffUid = playerData.ffUid || user.ffUid || "198273819";
    const phone = playerData.phone || user.phone || "01712345678";

    // Check if already registered
    const alreadyJoined = tournament.participants.some(p => p.ffUid === ffUid || p.playerName === ign);
    if (alreadyJoined) {
      throw new Error("You have already registered for this tournament!");
    }

    tournament.slotsFilled += 1;
    const assignedSlot = tournament.slotsFilled;

    const participantRecord = {
      playerName: ign,
      ffUid: ffUid,
      phone: phone,
      joinedAt: new Date().toLocaleString(),
      slot: assignedSlot
    };

    tournament.participants.push(participantRecord);
    this.save();

    authService.recordTournamentJoin(tournamentId);

    // Instant bi-directional Cloud Firestore sync
    try {
      firebaseService.saveToFirestore('tournaments', tournamentId, tournament);
      firebaseService.broadcastChange('TOURNAMENTS_UPDATED', tournament);
    } catch(e) {}

    return {
      success: true,
      tournament,
      assignedSlot,
      roomId: tournament.roomId || "Pending Release",
      passcode: tournament.roomPass || "Pending Release",
      isRoomReleased: tournament.isRoomReleased
    };
  }

  save() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mobinx_tournaments_data', JSON.stringify(this.tournaments));
    }
  }
}

export const tournamentService = new TournamentService();

