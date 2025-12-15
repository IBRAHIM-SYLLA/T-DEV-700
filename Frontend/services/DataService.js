import mockData from '../data/mockData.json';

/**
 * Service pour gérer les données mockées
 * Plus tard, remplacer par des appels API réels
 */
class DataService {
  
  /**
   * Simuler un délai réseau
   */
  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * TEAMS - Gestion des équipes
   */
  async getAllTeams() {
    await this.delay();
    return mockData.teams;
  }

  async getTeamById(teamId) {
    await this.delay();
    return mockData.teams.find(t => t.team_id === teamId);
  }

  async getTeamsByManagerId(managerId) {
    await this.delay();
    return mockData.teams.filter(t => t.manager_id === managerId);
  }

  /**
   * USERS - Gestion des utilisateurs
   */
  async getAllUsers() {
    await this.delay();
    return mockData.users;
  }

  async getUserById(userId) {
    await this.delay();
    return mockData.users.find(u => u.user_id === userId);
  }

  async getUsersByTeamId(teamId) {
    await this.delay();
    return mockData.users.filter(u => u.team_id === teamId);
  }

  async getUsersByRole(role) {
    await this.delay();
    return mockData.users.filter(u => u.role === role);
  }

  /**
   * WORK SCHEDULES - Gestion des plannings
   */
  async getAllSchedules() {
    await this.delay();
    return mockData.work_schedules;
  }

  async getSchedulesByUserId(userId) {
    await this.delay();
    return mockData.work_schedules.filter(s => s.user_id === userId);
  }

  async getScheduleByUserIdAndDay(userId, dayOfWeek) {
    await this.delay();
    return mockData.work_schedules.find(
      s => s.user_id === userId && s.day_of_week === dayOfWeek
    );
  }

  /**
   * CLOCKS - Gestion des pointages
   */
  async getAllClocks() {
    await this.delay();
    return mockData.clocks;
  }

  async getClocksByUserId(userId) {
    await this.delay();
    return mockData.clocks.filter(c => c.user_id === userId);
  }

  async getClocksByTeamId(teamId) {
    await this.delay();
    // Get all users in the team
    const teamUsers = await this.getUsersByTeamId(teamId);
    const userIds = teamUsers.map(u => u.user_id);
    // Get clocks for these users
    return mockData.clocks.filter(c => userIds.includes(c.user_id));
  }

  async getPendingClocks(teamId) {
    await this.delay();
    // Clocks without departure_time are considered pending
    const teamClocks = await this.getClocksByTeamId(teamId);
    return teamClocks.filter(c => c.departure_time === null);
  }

  /**
   * STATISTICS - Calculs statistiques
   */
  async getTeamStats(teamId) {
    await this.delay();
    const teamUsers = await this.getUsersByTeamId(teamId);
    const teamClocks = await this.getClocksByTeamId(teamId);
    
    // Calculate stats
    const totalMembers = teamUsers.length;
    const today = new Date().toISOString().split('T')[0];
    const todayClocks = teamClocks.filter(c => 
      c.arrival_time.startsWith(today)
    );
    
    const presentToday = todayClocks.length;
    
    // Calculate late arrivals (simplified - would need schedule comparison)
    const lateToday = todayClocks.filter(c => {
      const arrivalTime = new Date(c.arrival_time).getHours();
      return arrivalTime > 9; // Simplified: late if after 9am
    }).length;

    return {
      totalMembers,
      presentToday,
      lateToday,
      absentToday: totalMembers - presentToday,
      pendingValidations: teamClocks.filter(c => !c.departure_time).length
    };
  }

  async getUserStats(userId) {
    await this.delay();
    const userClocks = await this.getClocksByUserId(userId);
    
    // Calculate total hours worked
    let totalHours = 0;
    let lateCount = 0;
    
    userClocks.forEach(clock => {
      if (clock.departure_time) {
        const arrival = new Date(clock.arrival_time);
        const departure = new Date(clock.departure_time);
        const hours = (departure - arrival) / (1000 * 60 * 60);
        totalHours += hours;
      }
      
      // Check if late (simplified)
      const arrivalHour = new Date(clock.arrival_time).getHours();
      if (arrivalHour > 9) lateCount++;
    });

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      totalDays: userClocks.length,
      lateCount,
      currentMonth: {
        hours: Math.round(totalHours * 10) / 10,
        days: userClocks.length
      }
    };
  }

  /**
   * MANAGER SPECIFIC - Fonctions spécifiques au manager
   */
  async getManagerTeams(managerId) {
    await this.delay();
    return this.getTeamsByManagerId(managerId);
  }

  async getManagerEmployees(managerId) {
    await this.delay();
    const teams = await this.getTeamsByManagerId(managerId);
    const teamIds = teams.map(t => t.team_id);
    
    const allEmployees = [];
    for (const teamId of teamIds) {
      const employees = await this.getUsersByTeamId(teamId);
      allEmployees.push(...employees);
    }
    
    return allEmployees;
  }

  /**
   * ATTENDANCE RULES - Règles d'émargement
   */
  async getAttendanceRules() {
    await this.delay();
    return {
      toleranceMinutes: 5,
      lunchBreakDuration: 60,
      maxDailyHours: 10,
      minDailyHours: 7
    };
  }

  /**
   * CLOCK IN/OUT - Pointage
   */
  async clockIn(userId) {
    await this.delay();
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    
    // Créer un nouveau pointage
    const newClock = {
      clock_id: mockData.clocks.length + 1,
      user_id: userId,
      arrival_time: timestamp,
      departure_time: null
    };
    
    // Ajouter au mock data (simulation)
    mockData.clocks.push(newClock);
    
    return newClock;
  }

  async clockOut(userId) {
    await this.delay();
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    const today = now.toISOString().split('T')[0];
    
    // Trouver le pointage d'aujourd'hui
    const todayClock = mockData.clocks.find(c => 
      c.user_id === userId && 
      c.arrival_time.startsWith(today) &&
      !c.departure_time
    );
    
    if (todayClock) {
      todayClock.departure_time = timestamp;
      return todayClock;
    }
    
    return null;
  }
}

// Export singleton instance
export default new DataService();
