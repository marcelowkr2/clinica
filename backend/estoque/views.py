from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny
from django.db.models import Q, Sum, Count, F
import logging
from .models import Product
from .serializers import ProductSerializer, ProductCreateSerializer

logger = logging.getLogger(__name__)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    permission_classes = [AllowAny]  # Temporarily allow access without authentication for testing
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateSerializer
        return ProductSerializer
    
    def create(self, request, *args, **kwargs):
        """Override create method to add detailed logging"""
        logger.info(f"🔍 CREATE REQUEST - Method: {request.method}")
        logger.info(f"🔍 CREATE REQUEST - Content-Type: {request.content_type}")
        logger.info(f"🔍 CREATE REQUEST - Data received: {request.data}")
        logger.info(f"🔍 CREATE REQUEST - Data type: {type(request.data)}")
        
        # Log each field individually
        for key, value in request.data.items():
            logger.info(f"🔍 Field '{key}': {value} (type: {type(value)})")
        
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            logger.error(f"❌ VALIDATION ERRORS: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        logger.info("✅ Validation passed, creating product...")
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        logger.info(f"✅ Product created successfully: {serializer.data}")
        
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def get_queryset(self):
        queryset = Product.objects.all()
        
        # Filtros
        status_filter = self.request.query_params.get('status', None)
        categoria = self.request.query_params.get('categoria', None)
        search = self.request.query_params.get('search', None)
        estoque_baixo = self.request.query_params.get('estoque_baixo', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        if categoria:
            queryset = queryset.filter(categoria__icontains=categoria)
            
        if search:
            queryset = queryset.filter(
                Q(nome__icontains=search) |
                Q(codigo__icontains=search) |
                Q(marca__icontains=search) |
                Q(categoria__icontains=search)
            )
            
        if estoque_baixo == 'true':
            queryset = queryset.filter(quantidade_atual__lte=F('quantidade_minima'))
            
        return queryset.order_by('-data_cadastro')
    
    @action(detail=False, methods=['get'])
    def estatisticas(self, request):
        """Retorna estatísticas do estoque"""
        total_produtos = Product.objects.count()
        produtos_ativos = Product.objects.filter(status='ativo').count()
        produtos_estoque_baixo = Product.objects.filter(
            quantidade_atual__lte=F('quantidade_minima')
        ).count()
        
        valor_total_estoque = Product.objects.aggregate(
            total=Sum(F('quantidade_atual') * F('preco_compra'))
        )['total'] or 0
        
        return Response({
            'total_produtos': total_produtos,
            'produtos_ativos': produtos_ativos,
            'produtos_estoque_baixo': produtos_estoque_baixo,
            'valor_total_estoque': float(valor_total_estoque)
        })
    
    @action(detail=False, methods=['get'])
    def categorias(self, request):
        """Retorna lista de categorias únicas"""
        categorias = Product.objects.values_list('categoria', flat=True).distinct()
        return Response(list(categorias))
    
    @action(detail=False, methods=['get'])
    def estoque_baixo(self, request):
        """Retorna produtos com estoque baixo"""
        produtos = Product.objects.filter(
            quantidade_atual__lte=F('quantidade_minima')
        ).order_by('quantidade_atual')
        
        serializer = self.get_serializer(produtos, many=True)
        return Response(serializer.data)
