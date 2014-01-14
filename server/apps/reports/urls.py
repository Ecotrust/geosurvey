from django.conf.urls.defaults import *
from reports.views import (full_data_dump_csv, get_crosstab_json,
                           get_crosstab_csv, get_distribution, get_geojson,
                           grid_standard_deviation_json,
                           grid_standard_deviation_csv,
                           surveyor_stats_csv, surveyor_stats_json,
                           surveyor_stats_raw_data_csv,
                           single_select_count_csv,
                           single_select_count_json,
                           gear_type_frequency_csv,
                           gear_type_frequency_json,
                           vendor_resource_type_frequency_csv,
                           vendor_resource_type_frequency_json,
                           activity_locations_csv)


urlpatterns = patterns('',
    (r'/distribution/(?P<survey_slug>[\w\d-]+)/(?P<question_slug>[\w\d-]+)', get_distribution),
    (r'/crosstab/(?P<survey_slug>[\w\d-]+)/(?P<question_a_slug>[\w\d-]+)/(?P<question_b_slug>[\w\d-]+).csv', get_crosstab_csv),
    (r'/crosstab/(?P<survey_slug>[\w\d-]+)/(?P<question_a_slug>[\w\d-]+)/(?P<question_b_slug>[\w\d-]+)', get_crosstab_json),
    (r'/geojson/(?P<survey_slug>[\w\d-]+)/(?P<question_slug>[\w\d-]+)', get_geojson),

    url(r'/surveyor-stats/(?P<survey_slug>[\w\d-]+).csv',
        surveyor_stats_raw_data_csv,
        name='reports_surveyor_stats_raw_data_csv'),

    url(r'/surveyor-stats/(?P<survey_slug>[\w\d-]+)/(?P<interval>[\w]+).csv',
        surveyor_stats_csv,
        name='reports_surveyor_stats_csv'),

    url(r'/surveyor-stats/(?P<survey_slug>[\w\d-]+)/(?P<interval>[\w]+)',
        surveyor_stats_json,
        name='reports_surveyor_stats_json'),

    url(r'/grid-standard-deviation/(?P<question_slug>[\w\d-]+)/(?P<interval>[\w]+).csv',
        grid_standard_deviation_csv,
        name='reports_grid_standard_deviation_csv'),

    url(r'/grid-standard-deviation/(?P<question_slug>[\w\d-]+)/(?P<interval>[\w]+)',
        grid_standard_deviation_json,
        name='reports_grid_standard_deviation_json'),

    url(r'/vendor-resource-frequency.csv',
        vendor_resource_type_frequency_csv,
        name='vendor_resource_type_frequency_csv'),

    url(r'/vendor-resource-frequency',
        vendor_resource_type_frequency_json,
        name='vendor_resource_type_frequency_json'),

    url(r'/gear-type-frequency.csv',
        gear_type_frequency_csv,
        name='gear_type_frequency_csv'),

    url(r'/gear-type-frequency',
        gear_type_frequency_json,
        name='gear_type_frequency_json'),

    url(r'/single-select-count/(?P<question_slug>[\w\d-]+).csv',
        single_select_count_csv,
        name='single_select_count_csv'),

    url(r'/single-select-count/(?P<question_slug>[\w\d-]+)',
        single_select_count_json,
        name='single_select_count_json'),

    url(r'/full-survey-data/(?P<survey_slug>[\w\d-]+)',
        full_data_dump_csv,
        name='reports_full_data_dump_csv'),

    url(r'/activity-location-data/(?P<survey_slug>[\w\d-]+)',
        activity_locations_csv,
        name='reports_activity_locations_csv'),
)
