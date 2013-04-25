import os
from django.contrib.gis.utils import LayerMapping
from models import ShoreLine

# Auto-generated `LayerMapping` dictionary for ShoreLine model
shoreline_mapping = {
    's_scale' : 'S_SCALE',
    's_chart' : 'S_CHART',
    's_datum' : 'S_DATUM',
    's_rev_date' : 'S_REV_DATE',
    's_source' : 'S_SOURCE',
    's_arc_code' : 'S_ARC_CODE',
    's_integrit' : 'S_INTEGRIT',
    'regions' : 'REGIONS',
    'geom' : 'MULTILINESTRING',
}

shp = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../data/us_medium_shoreline.shp'))

def run(verbose=True):
    lm = LayerMapping(ShoreLine, shp, shoreline_mapping, transform=False, encoding='iso-8859-1')
    lm.save(strict=True, verbose=verbose)