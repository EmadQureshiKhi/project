from fridonai_core.graph import generate_response
from libs.community.plugins.coin_technical_analyzer import CoinsTechnicalAnalyzerPlugin
from libs.community.plugins.coin_technical_chart_searcher import CoinTechnicalChartSearcherPlugin
from libs.community.plugins.coin_observer import CoinObserverPlugin
from libs.community.plugins.wallet import WalletPlugin
from libs.community.plugins.jupiter import JupiterPlugin

async def analyze_coin(message: str, config: dict):
    plugins = [
        CoinsTechnicalAnalyzerPlugin(),
        CoinTechnicalChartSearcherPlugin(),
        CoinObserverPlugin(),
        WalletPlugin(),
        JupiterPlugin()
    ]
    
    response = await generate_response(
        message,
        plugins,
        config,
        memory="sqlite"
    )
    return response
