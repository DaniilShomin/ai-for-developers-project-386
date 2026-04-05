import "@typespec/http";

using TypeSpec.Http;

@doc("Owner - Владелец календаря. Публикует доступное время для встреч.")
model Owner {
  @doc("Уникальный идентификатор")
  id: string;

  @doc("Имя владельца")
  name: string;

  @doc("Email владельца")
  email: string;

  @doc("Часовой пояс")
  timezone: string;

  @doc("Дата создания")
  createdAt: utcDateTime;
}

@doc("Booker - Пользователь, записывающийся на звонок")
model Booker {
  @doc("Уникальный идентификатор")
  id: string;

  @doc("Имя")
  name: string;

  @doc("Email для связи")
  email: string;

  @doc("Телефон (опционально)")
  phone?: string;

  @doc("Дата создания")
  createdAt: utcDateTime;
}

@doc("TimeSlot - Временной слот на 30 минут")
model TimeSlot {
  @doc("Уникальный идентификатор")
  id: string;

  @doc("ID владельца")
  ownerId: string;

  @doc("Время начала")
  startTime: utcDateTime;

  @doc("Время окончания (startTime + 30 мин)")
  endTime: utcDateTime;

  @doc("Забронирован ли слот")
  isBooked: boolean;

  @doc("Дата создания")
  createdAt: utcDateTime;
}

@doc("Данные для создания временного слота")
model TimeSlotCreate {
  @doc("ID владельца")
  ownerId: string;

  @doc("Время начала слота")
  startTime: utcDateTime;
}

@doc("Статус бронирования")
enum BookingStatus {
  confirmed,
  cancelled,
}

@doc("Booking - Бронирование временного слота")
model Booking {
  @doc("Уникальный идентификатор")
  id: string;

  @doc("ID временного слота")
  timeSlotId: string;

  @doc("ID записывающегося")
  bookerId: string;

  @doc("Заметки к встрече")
  notes?: string;

  @doc("Статус бронирования")
  status: BookingStatus;

  @doc("Дата создания")
  createdAt: utcDateTime;
}

@doc("Данные для создания бронирования")
model BookingCreate {
  @doc("ID временного слота")
  timeSlotId: string;

  @doc("Имя записывающегося")
  bookerName: string;

  @doc("Email записывающегося")
  bookerEmail: string;

  @doc("Телефон (опционально)")
  bookerPhone?: string;

  @doc("Заметки")
  notes?: string;
}

@doc("Бронирование с полными деталями")
model BookingWithDetails {
  @doc("Уникальный идентификатор")
  id: string;

  @doc("ID временного слота")
  timeSlotId: string;

  @doc("ID записывающегося")
  bookerId: string;

  @doc("Заметки")
  notes?: string;

  @doc("Статус")
  status: BookingStatus;

  @doc("Дата создания")
  createdAt: utcDateTime;

  @doc("Детали слота")
  timeSlot: TimeSlot;

  @doc("Данные записывающегося")
  booker: Booker;
}

@doc("Стандартная модель ошибки")
model ErrorResponse {
  @doc("Код ошибки")
  code: string;

  @doc("Сообщение об ошибке")
  message: string;
}
