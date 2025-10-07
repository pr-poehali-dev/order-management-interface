import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type TransportType = 'flight' | 'train' | 'bus';
type SegmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'refunded';
type OrderStatus = 'active' | 'completed' | 'cancelled';
type ViewMode = 'segments' | 'passengers' | 'compact';

interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  category: 'adult' | 'child' | 'infant';
}

interface PassengerService {
  passengerId: string;
  serviceId: string;
  serviceName: string;
  price: number;
}

interface Segment {
  id: string;
  type: TransportType;
  status: SegmentStatus;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  carrier: string;
  flightNumber: string;
  passengerServices: PassengerService[];
}

interface Order {
  id: string;
  status: OrderStatus;
  createdAt: string;
  segments: Segment[];
  passengers: Passenger[];
}

const mockOrder: Order = {
  id: 'ORD-2025-10-001',
  status: 'active',
  createdAt: '2025-10-01T10:30:00',
  passengers: [
    { id: 'p1', firstName: 'Иван', lastName: 'Петров', documentNumber: '4517 123456', category: 'adult' },
    { id: 'p2', firstName: 'Мария', lastName: 'Петрова', documentNumber: '4518 654321', category: 'adult' },
    { id: 'p3', firstName: 'Анна', lastName: 'Петрова', documentNumber: '4519 789012', category: 'child' },
  ],
  segments: [
    {
      id: 's1',
      type: 'flight',
      status: 'confirmed',
      from: 'Москва (SVO)',
      to: 'Санкт-Петербург (LED)',
      departureDate: '2025-10-15',
      departureTime: '08:30',
      arrivalDate: '2025-10-15',
      arrivalTime: '10:00',
      carrier: 'Аэрофлот',
      flightNumber: 'SU 1234',
      passengerServices: [
        { passengerId: 'p1', serviceId: 'srv1', serviceName: 'Билет (эконом)', price: 5000 },
        { passengerId: 'p1', serviceId: 'srv2', serviceName: 'Багаж 23кг', price: 1500 },
        { passengerId: 'p1', serviceId: 'srv3', serviceName: 'Место 12A', price: 500 },
        { passengerId: 'p2', serviceId: 'srv4', serviceName: 'Билет (эконом)', price: 5000 },
        { passengerId: 'p2', serviceId: 'srv5', serviceName: 'Багаж 23кг', price: 1500 },
      ],
    },
    {
      id: 's2',
      type: 'train',
      status: 'confirmed',
      from: 'Санкт-Петербург',
      to: 'Москва',
      departureDate: '2025-10-20',
      departureTime: '18:00',
      arrivalDate: '2025-10-21',
      arrivalTime: '02:00',
      carrier: 'РЖД',
      flightNumber: '001А',
      passengerServices: [
        { passengerId: 'p1', serviceId: 'srv6', serviceName: 'Купе верхнее', price: 3500 },
        { passengerId: 'p1', serviceId: 'srv7', serviceName: 'Питание', price: 800 },
        { passengerId: 'p2', serviceId: 'srv8', serviceName: 'Купе нижнее', price: 4000 },
        { passengerId: 'p2', serviceId: 'srv9', serviceName: 'Питание', price: 800 },
        { passengerId: 'p3', serviceId: 'srv10', serviceName: 'Плацкарт', price: 2200 },
        { passengerId: 'p3', serviceId: 'srv11', serviceName: 'Питание', price: 600 },
      ],
    },
    {
      id: 's3',
      type: 'bus',
      status: 'pending',
      from: 'Москва',
      to: 'Тула',
      departureDate: '2025-10-22',
      departureTime: '14:00',
      arrivalDate: '2025-10-22',
      arrivalTime: '17:30',
      carrier: 'Фликсбас',
      flightNumber: 'FB-405',
      passengerServices: [
        { passengerId: 'p1', serviceId: 'srv12', serviceName: 'Билет', price: 1200 },
      ],
    },
    {
      id: 's4',
      type: 'flight',
      status: 'cancelled',
      from: 'Тула',
      to: 'Казань (KZN)',
      departureDate: '2025-10-23',
      departureTime: '09:00',
      arrivalDate: '2025-10-23',
      arrivalTime: '11:30',
      carrier: 'Победа',
      flightNumber: 'DP 892',
      passengerServices: [
        { passengerId: 'p1', serviceId: 'srv13', serviceName: 'Билет', price: 3200 },
        { passengerId: 'p2', serviceId: 'srv14', serviceName: 'Билет', price: 3200 },
      ],
    },
  ],
};

const Index = () => {
  const [order] = useState<Order>(mockOrder);
  const [viewMode, setViewMode] = useState<ViewMode>('segments');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'cancel' | 'refund' | 'cancelOrder' | 'refundOrder' | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [selectedPassenger, setSelectedPassenger] = useState<string | null>(null);

  const getTransportIcon = (type: TransportType) => {
    switch (type) {
      case 'flight': return 'Plane';
      case 'train': return 'Train';
      case 'bus': return 'Bus';
    }
  };

  const getTransportLabel = (type: TransportType) => {
    switch (type) {
      case 'flight': return 'Авиа';
      case 'train': return 'Поезд';
      case 'bus': return 'Автобус';
    }
  };

  const getStatusColor = (status: SegmentStatus) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'refunded': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusText = (status: SegmentStatus) => {
    switch (status) {
      case 'confirmed': return 'Подтверждён';
      case 'pending': return 'Ожидает';
      case 'cancelled': return 'Отменён';
      case 'refunded': return 'Возвращён';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'adult': return 'Взрослый';
      case 'child': return 'Ребёнок';
      case 'infant': return 'Младенец';
      default: return '';
    }
  };

  const handleAction = (segment: Segment | null, action: 'cancel' | 'refund' | 'cancelOrder' | 'refundOrder', passengerId?: string) => {
    setSelectedSegment(segment);
    setSelectedPassenger(passengerId || null);
    setActionType(action);
    setDialogOpen(true);
  };

  const confirmAction = () => {
    if (actionType === 'cancelOrder') {
      toast.success('Весь заказ отменён');
    } else if (actionType === 'refundOrder') {
      toast.success('Возврат по всему заказу оформлен');
    } else if (selectedPassenger) {
      toast.success(`Услуги для ${getPassengerName(selectedPassenger)} в сегменте ${selectedSegment?.flightNumber} ${actionType === 'cancel' ? 'отменены' : 'возвращены'}`);
    } else {
      toast.success(
        actionType === 'cancel' 
          ? `Сегмент ${selectedSegment?.flightNumber} отменён` 
          : `Возврат по сегменту ${selectedSegment?.flightNumber} оформлен`
      );
    }
    setDialogOpen(false);
  };

  const getPassengerName = (passengerId: string) => {
    const passenger = order.passengers.find(p => p.id === passengerId);
    return passenger ? `${passenger.firstName} ${passenger.lastName}` : '';
  };

  const getPassengerById = (passengerId: string) => {
    return order.passengers.find(p => p.id === passengerId);
  };

  const getSegmentPassengers = (segment: Segment) => {
    const passengerIds = [...new Set(segment.passengerServices.map(ps => ps.passengerId))];
    return passengerIds.map(id => order.passengers.find(p => p.id === id)!).filter(Boolean);
  };

  const getPassengerServicesInSegment = (segment: Segment, passengerId: string) => {
    return segment.passengerServices.filter(ps => ps.passengerId === passengerId);
  };

  const getSegmentTotalPrice = (segment: Segment) => {
    return segment.passengerServices.reduce((sum, ps) => sum + ps.price, 0);
  };

  const getOrderTotalPrice = () => {
    return order.segments
      .filter(seg => seg.status !== 'cancelled')
      .reduce((sum, seg) => sum + getSegmentTotalPrice(seg), 0);
  };

  const getPassengerSegments = (passengerId: string) => {
    return order.segments.filter(seg => 
      seg.passengerServices.some(ps => ps.passengerId === passengerId)
    );
  };

  const getPassengerTotalSpent = (passengerId: string) => {
    return order.segments.reduce((sum, seg) => {
      const passengerServices = seg.passengerServices.filter(ps => ps.passengerId === passengerId);
      return sum + passengerServices.reduce((s, ps) => s + ps.price, 0);
    }, 0);
  };

  const filteredSegments = statusFilter === 'all' 
    ? order.segments 
    : order.segments.filter(seg => seg.status === statusFilter);

  const confirmedCount = order.segments.filter(s => s.status === 'confirmed').length;
  const pendingCount = order.segments.filter(s => s.status === 'pending').length;
  const cancelledCount = order.segments.filter(s => s.status === 'cancelled').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Заказ {order.id}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Icon name="Calendar" size={16} />
                <span>Создан {new Date(order.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Icon name="Users" size={16} />
                <span>{order.passengers.length} пассажир{order.passengers.length > 1 ? 'а' : ''}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Icon name="Route" size={16} />
                <span>{order.segments.length} сегмент{order.segments.length > 1 ? 'а' : ''}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="h-9 px-4 bg-primary text-primary-foreground border-0 text-sm">
              {order.status === 'active' ? 'Активный' : order.status === 'completed' ? 'Завершён' : 'Отменён'}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9">
                  <Icon name="MoreVertical" size={18} className="mr-2" />
                  Действия
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Операции с заказом</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleAction(null, 'cancelOrder')}>
                  <Icon name="XCircle" size={16} className="mr-2" />
                  Отменить весь заказ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction(null, 'refundOrder')}>
                  <Icon name="RefreshCcw" size={16} className="mr-2" />
                  Вернуть весь заказ
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Документы</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Icon name="Download" size={16} className="mr-2" />
                  Скачать PDF
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Icon name="Mail" size={16} className="mr-2" />
                  Отправить на почту
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Icon name="Printer" size={16} className="mr-2" />
                  Печать
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-2 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Общая стоимость</p>
                <p className="text-2xl font-bold text-foreground">{getOrderTotalPrice().toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name="Wallet" size={20} className="text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setStatusFilter('confirmed')}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Подтверждено</p>
                <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Icon name="CheckCircle" size={20} className="text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setStatusFilter('pending')}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ожидает</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Icon name="Clock" size={20} className="text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setStatusFilter('cancelled')}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Отменено</p>
                <p className="text-2xl font-bold text-gray-600">{cancelledCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Icon name="XCircle" size={20} className="text-gray-600" />
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4 border-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                <Icon name="Filter" size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium">Фильтр:</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    {statusFilter === 'all' && 'Все сегменты'}
                    {statusFilter === 'confirmed' && 'Подтверждённые'}
                    {statusFilter === 'pending' && 'Ожидающие'}
                    {statusFilter === 'cancelled' && 'Отменённые'}
                    {statusFilter === 'refunded' && 'Возвращённые'}
                    <Icon name="ChevronDown" size={16} className="ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                    Все сегменты
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('confirmed')}>
                    Подтверждённые
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                    Ожидающие
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>
                    Отменённые
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('refunded')}>
                    Возвращённые
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">Вид:</span>
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                <Button
                  variant={viewMode === 'segments' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('segments')}
                  className="h-8"
                >
                  <Icon name="List" size={16} className="mr-1.5" />
                  Сегменты
                </Button>
                <Button
                  variant={viewMode === 'passengers' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('passengers')}
                  className="h-8"
                >
                  <Icon name="Users" size={16} className="mr-1.5" />
                  Пассажиры
                </Button>
                <Button
                  variant={viewMode === 'compact' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('compact')}
                  className="h-8"
                >
                  <Icon name="LayoutGrid" size={16} className="mr-1.5" />
                  Компактно
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {viewMode === 'segments' && (
          <div className="space-y-4">
            {filteredSegments.map((segment, index) => {
              const passengers = getSegmentPassengers(segment);
              const totalPrice = getSegmentTotalPrice(segment);

              return (
                <Card key={segment.id} className="overflow-hidden border-2 hover:shadow-xl transition-all">
                  <div className="p-5 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 border-2 border-primary/20">
                          <Icon name={getTransportIcon(segment.type)} size={24} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs font-medium">
                              {getTransportLabel(segment.type)}
                            </Badge>
                            <Badge className={`${getStatusColor(segment.status)} border text-xs`}>
                              {getStatusText(segment.status)}
                            </Badge>
                          </div>
                          <h3 className="text-xl font-bold mb-1">{segment.carrier}</h3>
                          <p className="text-sm text-muted-foreground">Рейс {segment.flightNumber}</p>
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-xs text-muted-foreground mb-1">Стоимость сегмента</p>
                        <p className="text-3xl font-bold text-primary">{totalPrice.toLocaleString('ru-RU')} ₽</p>
                        <p className="text-xs text-muted-foreground mt-1">{passengers.length} пассажир{passengers.length > 1 ? 'а' : ''}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 p-4 bg-gradient-to-r from-muted/50 to-muted/20 rounded-xl border">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                          <Icon name="MapPin" size={20} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">Отправление</p>
                          <p className="font-bold text-base truncate">{segment.from}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(segment.departureDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })} · {segment.departureTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                          <Icon name="MapPinCheckInside" size={20} className="text-green-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">Прибытие</p>
                          <p className="font-bold text-base truncate">{segment.to}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(segment.arrivalDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })} · {segment.arrivalTime}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Пассажиры и услуги</h4>
                        <span className="text-xs text-muted-foreground">{passengers.length} чел.</span>
                      </div>

                      {passengers.map((passenger) => {
                        const services = getPassengerServicesInSegment(segment, passenger.id);
                        const passengerTotal = services.reduce((sum, s) => sum + s.price, 0);

                        return (
                          <Card key={passenger.id} className="p-4 bg-background/50 hover:bg-background/80 transition-colors border">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center border-2 border-secondary/20">
                                  <Icon name="User" size={18} className="text-secondary" />
                                </div>
                                <div>
                                  <p className="font-semibold text-base">{passenger.firstName} {passenger.lastName}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <Badge variant="outline" className="text-xs h-5">
                                      {getCategoryLabel(passenger.category)}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{passenger.documentNumber}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold">{passengerTotal.toLocaleString('ru-RU')} ₽</p>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 mt-1">
                                      <Icon name="MoreHorizontal" size={16} />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleAction(segment, 'cancel', passenger.id)}>
                                      <Icon name="XCircle" size={14} className="mr-2" />
                                      Отменить услуги
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAction(segment, 'refund', passenger.id)}>
                                      <Icon name="RefreshCcw" size={14} className="mr-2" />
                                      Вернуть услуги
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            <Separator className="mb-3" />

                            <div className="space-y-2">
                              {services.map((service) => (
                                <div key={service.serviceId} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <Icon name="Check" size={14} className="text-green-600 flex-shrink-0" />
                                    <span className="text-muted-foreground">{service.serviceName}</span>
                                  </div>
                                  <span className="font-medium">{service.price.toLocaleString('ru-RU')} ₽</span>
                                </div>
                              ))}
                            </div>
                          </Card>
                        );
                      })}
                    </div>

                    {segment.status === 'confirmed' && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAction(segment, 'cancel')}
                          className="flex-1"
                        >
                          <Icon name="XCircle" size={16} className="mr-2" />
                          Отменить сегмент
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAction(segment, 'refund')}
                          className="flex-1"
                        >
                          <Icon name="RefreshCcw" size={16} className="mr-2" />
                          Возврат сегмента
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {viewMode === 'passengers' && (
          <div className="space-y-4">
            {order.passengers.map((passenger) => {
              const segments = getPassengerSegments(passenger.id);
              const totalSpent = getPassengerTotalSpent(passenger.id);

              return (
                <Card key={passenger.id} className="p-5 md:p-6 border-2 hover:shadow-xl transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center flex-shrink-0 border-2 border-secondary/20">
                      <Icon name="User" size={32} className="text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-4">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">{passenger.firstName} {passenger.lastName}</h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="text-xs">{getCategoryLabel(passenger.category)}</Badge>
                            <span className="text-sm text-muted-foreground">{passenger.documentNumber}</span>
                          </div>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-xs text-muted-foreground mb-1">Общая стоимость</p>
                          <p className="text-3xl font-bold text-primary">{totalSpent.toLocaleString('ru-RU')} ₽</p>
                          <p className="text-xs text-muted-foreground mt-1">{segments.length} сегмент{segments.length > 1 ? 'а' : ''}</p>
                        </div>
                      </div>
                      
                      <Separator className="mb-4" />

                      <div className="space-y-3">
                        <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Маршрут пассажира</h4>
                        {segments.map((segment, idx) => {
                          const services = getPassengerServicesInSegment(segment, passenger.id);
                          const segmentTotal = services.reduce((sum, s) => sum + s.price, 0);

                          return (
                            <div key={segment.id} className="relative">
                              {idx > 0 && (
                                <div className="absolute left-5 -top-3 w-0.5 h-3 bg-border"></div>
                              )}
                              <div className="bg-muted/30 p-4 rounded-xl border hover:bg-muted/50 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                                      <Icon name={getTransportIcon(segment.type)} size={20} className="text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-bold text-sm truncate">{segment.from} → {segment.to}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {segment.carrier} {segment.flightNumber} · {new Date(segment.departureDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge className={`${getStatusColor(segment.status)} border text-xs flex-shrink-0 ml-2`}>
                                    {getStatusText(segment.status)}
                                  </Badge>
                                </div>

                                <div className="space-y-1.5 mb-2">
                                  {services.map((service) => (
                                    <div key={service.serviceId} className="flex items-center justify-between text-xs">
                                      <span className="text-muted-foreground flex items-center gap-1.5">
                                        <Icon name="Check" size={12} className="text-green-600" />
                                        {service.serviceName}
                                      </span>
                                      <span className="font-medium">{service.price.toLocaleString('ru-RU')} ₽</span>
                                    </div>
                                  ))}
                                </div>

                                <Separator className="my-2" />

                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-semibold">Итого</span>
                                  <span className="font-bold text-primary">{segmentTotal.toLocaleString('ru-RU')} ₽</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {viewMode === 'compact' && (
          <Card className="p-5 md:p-6 border-2">
            <div className="space-y-6">
              {filteredSegments.map((segment, index) => {
                const passengers = getSegmentPassengers(segment);
                const totalPrice = getSegmentTotalPrice(segment);

                return (
                  <div key={segment.id}>
                    {index > 0 && <Separator />}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name={getTransportIcon(segment.type)} size={20} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold truncate">{segment.from} → {segment.to}</p>
                            <Badge className={`${getStatusColor(segment.status)} border text-xs flex-shrink-0`}>
                              {getStatusText(segment.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {segment.carrier} {segment.flightNumber} · {new Date(segment.departureDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} · {passengers.length} чел.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xl font-bold">{totalPrice.toLocaleString('ru-RU')} ₽</p>
                        </div>
                        {segment.status === 'confirmed' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Icon name="MoreHorizontal" size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleAction(segment, 'cancel')}>
                                <Icon name="XCircle" size={14} className="mr-2" />
                                Отменить
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction(segment, 'refund')}>
                                <Icon name="RefreshCcw" size={14} className="mr-2" />
                                Возврат
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'cancel' && (selectedPassenger ? 'Отмена услуг пассажира' : 'Отмена сегмента')}
              {actionType === 'refund' && (selectedPassenger ? 'Возврат услуг пассажира' : 'Возврат билета')}
              {actionType === 'cancelOrder' && 'Отмена всего заказа'}
              {actionType === 'refundOrder' && 'Возврат всего заказа'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'cancel' && !selectedPassenger && 'Вы уверены, что хотите отменить этот сегмент? Действие нельзя отменить.'}
              {actionType === 'refund' && !selectedPassenger && 'Вы уверены, что хотите оформить возврат по этому сегменту?'}
              {actionType === 'cancel' && selectedPassenger && 'Вы уверены, что хотите отменить все услуги этого пассажира в сегменте?'}
              {actionType === 'refund' && selectedPassenger && 'Вы уверены, что хотите оформить возврат услуг этого пассажира?'}
              {actionType === 'cancelOrder' && 'Вы уверены, что хотите отменить весь заказ? Все сегменты будут отменены.'}
              {actionType === 'refundOrder' && 'Вы уверены, что хотите оформить возврат по всему заказу?'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSegment && (
            <div className="py-4 space-y-3">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Icon name={getTransportIcon(selectedSegment.type)} size={18} className="text-primary" />
                  <p className="text-sm font-semibold">{selectedSegment.carrier} {selectedSegment.flightNumber}</p>
                </div>
                <p className="text-sm text-muted-foreground">{selectedSegment.from} → {selectedSegment.to}</p>
                <p className="text-sm text-muted-foreground">{selectedSegment.departureDate}</p>
                {selectedPassenger && (
                  <>
                    <Separator className="my-2" />
                    <p className="text-sm"><span className="font-semibold">Пассажир:</span> {getPassengerName(selectedPassenger)}</p>
                  </>
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Сумма возврата</span>
                <span className="text-lg font-bold">
                  {selectedPassenger 
                    ? getPassengerServicesInSegment(selectedSegment, selectedPassenger).reduce((sum, s) => sum + s.price, 0).toLocaleString('ru-RU')
                    : getSegmentTotalPrice(selectedSegment).toLocaleString('ru-RU')
                  } ₽
                </span>
              </div>
            </div>
          )}

          {!selectedSegment && (
            <div className="py-4 space-y-3">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">Детали заказа</p>
                <p className="text-sm">Заказ {order.id}</p>
                <p className="text-sm text-muted-foreground">Сегментов: {order.segments.length}</p>
                <p className="text-sm text-muted-foreground">Пассажиров: {order.passengers.length}</p>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Общая стоимость</span>
                <span className="text-lg font-bold">{getOrderTotalPrice().toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              variant={(actionType === 'cancel' || actionType === 'cancelOrder') ? 'destructive' : 'default'}
              onClick={confirmAction}
            >
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
