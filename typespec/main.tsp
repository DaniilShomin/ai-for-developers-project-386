import "@typespec/http";
import "@typespec/rest";
import "./models.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;

@service
@server("http://localhost:8000/api/v1", "Local development")
@server("https://api.booking.example.com/v1", "Production")
namespace BookingAPI;

@doc("Query параметры для получения временных слотов")
model ListTimeSlotsRequest {
  @doc("ID владельца (обязательно)")
  @query
  ownerId: string;

  @doc("Начальная дата")
  @query
  dateFrom?: utcDateTime;

  @doc("Конечная дата")
  @query
  dateTo?: utcDateTime;
}

@doc("Query параметры для получения бронирований")
model ListBookingsRequest {
  @doc("ID владельца")
  @query
  ownerId?: string;

  @doc("ID записывающегося")
  @query
  bookerId?: string;

  @doc("Статус бронирования")
  @query
  status?: BookingStatus;
}

@tag("Time Slots")
@route("/timeslots")
interface TimeSlots {
  @doc("Получить список доступных временных слотов")
  @get
  @summary("Список временных слотов")
  list(...ListTimeSlotsRequest): {
    @body slots: TimeSlot[];
  } | {
    @statusCode _: 400;
    @body error: ErrorResponse;
  } | {
    @statusCode _: 500;
    @body error: ErrorResponse;
  };

  @doc("Создать новый временной слот (30 минут)")
  @post
  @summary("Создать слот")
  create(@body slot: TimeSlotCreate): {
    @statusCode _: 201;
    @body createdSlot: TimeSlot;
  } | {
    @statusCode _: 400;
    @body error: ErrorResponse;
  } | {
    @statusCode _: 409;
    @body error: ErrorResponse;
  } | {
    @statusCode _: 500;
    @body error: ErrorResponse;
  };

  @doc("Удалить временной слот (только если не забронирован)")
  @delete
  @route("/{id}")
  @summary("Удалить слот")
  delete(@path id: string): {
    @statusCode _: 204;
  } | {
    @statusCode _: 404;
    @body error: ErrorResponse;
  } | {
    @statusCode _: 409;
    @body error: ErrorResponse;
  } | {
    @statusCode _: 500;
    @body error: ErrorResponse;
  };
}

@tag("Bookings")
@route("/bookings")
interface Bookings {
  @doc("Получить список бронирований с деталями")
  @get
  @summary("Список бронирований")
  list(...ListBookingsRequest): {
    @body bookings: BookingWithDetails[];
  } | {
    @statusCode _: 400;
    @body error: ErrorResponse;
  } | {
    @statusCode _: 500;
    @body error: ErrorResponse;
  };

  @doc("Получить детали конкретного бронирования")
  @get
  @route("/{id}")
  @summary("Детали бронирования")
  get(@path id: string): {
    @body booking: BookingWithDetails;
  } | {
    @statusCode _: 404;
    @body error: ErrorResponse;
  } | {
    @statusCode _: 500;
    @body error: ErrorResponse;
  };

  @doc("Создать новое бронирование")
  @post
  @summary("Создать бронирование")
  create(@body booking: BookingCreate): {
    @statusCode _: 201;
    @body createdBooking: Booking;
  } | {
    @statusCode _: 400;
    @body error: ErrorResponse;
  } | {
    @statusCode _: 404;
    @body error: ErrorResponse;
  } | {
    @statusCode _: 409;
    @body error: ErrorResponse;
  } | {
    @statusCode _: 500;
    @body error: ErrorResponse;
  };

  @doc("Отменить бронирование (soft delete)")
  @delete
  @route("/{id}")
  @summary("Отменить бронирование")
  cancel(@path id: string): {
    @body cancelledBooking: Booking;
  } | {
    @statusCode _: 404;
    @body error: ErrorResponse;
  } | {
    @statusCode _: 409;
    @body error: ErrorResponse;
  } | {
    @statusCode _: 500;
    @body error: ErrorResponse;
  };
}
