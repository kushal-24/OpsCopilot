import { prisma } from "../lib/prisma";
import { Prisma } from "../generated/prisma/client";

export type EventFilters = {
  datasetId?: string;
  activity?: string;
  caseId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  page: number;
  pageSize: number;
};

/**
 getEvents() queries the Event table, applies filters, sorts by newest, 
 paginates the results, and returns the rows along with 
 pagination metadata like total events and total pages.
 */

/** Paginated/filterable raw event log for the Data Explorer page. */
export async function getEvents(filters: EventFilters) {
  const where: Prisma.EventWhereInput = {
    activity: filters.activity,
    status: filters.status,
    timestamp:
      filters.startDate || filters.endDate
        ? { gte: filters.startDate, lte: filters.endDate }
        : undefined,
    case: {
      caseId: filters.caseId,
      datasetId: filters.datasetId,
    },
  };

  const [total, events] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      select: {
        id: true,
        eventId: true,
        activity: true,
        timestamp: true,
        resource: true,
        status: true,
        case: {
          select: { caseId: true, priority: true, channel: true, customerType: true },
        },
      },
    }),
  ]);

  const rows = events.map(({ case: c, ...event }) => ({
    ...event,
    caseId: c.caseId,
    priority: c.priority,
    channel: c.channel,
    customerType: c.customerType,
  }));

  return {
    rows,
    page: filters.page,
    pageSize: filters.pageSize,
    total,
    totalPages: filters.pageSize > 0 ? Math.ceil(total / filters.pageSize) : 0,
  };
}
