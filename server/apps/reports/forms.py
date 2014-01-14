import datetime

from django import forms


class APIFilterForm(forms.Form):
    start_date = forms.DateTimeField(input_formats=('%Y-%m-%d',),
                                     required=False)
    end_date = forms.DateTimeField(input_formats=('%Y-%m-%d',),
                                   required=False)

    def clean_end_date(self):
        data = self.cleaned_data['end_date']
        if data is not None:
            data += datetime.timedelta(days=1)
        return data

    # Change 'empty value' of the field to None
    def clean(self):
        cleaned_data = super(APIFilterForm, self).clean()
        for key in cleaned_data.iterkeys():
            if key not in self.data:
                cleaned_data[key] = None
        return cleaned_data


class SurveyorStatsForm(APIFilterForm):
    surveyor = forms.IntegerField(required=False)


class GridStandardDeviationForm(APIFilterForm):
    col = forms.CharField(required=False)
    row = forms.CharField(required=False)
