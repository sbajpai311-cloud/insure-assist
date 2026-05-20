// Mock stub — replace with actual Doctor on Demand vendor API
export interface DoctorAppointment {
  doctorId: string;
  doctorName: string;
  specialty: string;
  availableSlots: string[];
}

export async function getAvailableDoctors(): Promise<DoctorAppointment[]> {
  // Mocked response — integrate with real vendor API
  return [
    {
      doctorId: 'DOC001',
      doctorName: 'Dr. Priya Sharma',
      specialty: 'General Physician',
      availableSlots: ['2026-05-21T10:00:00', '2026-05-21T14:00:00', '2026-05-22T09:00:00'],
    },
    {
      doctorId: 'DOC002',
      doctorName: 'Dr. Rajesh Kumar',
      specialty: 'General Physician',
      availableSlots: ['2026-05-21T11:00:00', '2026-05-22T10:00:00'],
    },
  ];
}

export async function bookDoctorAppointment(doctorId: string, slot: string, patientName: string) {
  // Mocked booking confirmation
  return {
    bookingId: `BOOK_${Date.now()}`,
    doctorId,
    slot,
    patientName,
    status: 'CONFIRMED',
    meetingLink: 'https://meet.example.com/mocked-session',
  };
}
