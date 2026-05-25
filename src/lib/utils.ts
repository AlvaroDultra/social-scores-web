import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br";

dayjs.extend(relativeTime);
dayjs.locale("pt-br");

export function formatRelative(date: string) {
  return dayjs(date).fromNow();
}

export function formatDate(date: string) {
  return dayjs(date).format("DD/MM/YYYY HH:mm");
}

export function formatCountdown(endsAt: string): string {
  const diff = dayjs(endsAt).diff(dayjs(), "second");
  if (diff <= 0) return "Encerrado";
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function scoreColor(delta: number) {
  if (delta > 0) return "text-green-600";
  if (delta < 0) return "text-red-600";
  return "text-gray-500";
}

export function scorePrefix(delta: number) {
  return delta > 0 ? `+${delta}` : `${delta}`;
}
