import csv


class SlugCSVWriter(object):
    """ A CSV DictWriter that takes an OrderedDict for fieldnames.

    The purpose of using an OrderedDict allows you to use a slug or
    other unique value in your dictionary, but use non-unique names
    for your fields.
    """
    def __init__(self, f, fieldnames, restval="", extrasaction="raise",
                 dialect="excel", *args, **kwds):
        self.fieldnames = fieldnames
        self.restval = restval
        if extrasaction.lower() not in ("raise", "ignore"):
            raise ValueError("extrasaction (%s) must be 'raise' or"
                             " 'ignore'" % extrasaction)
        self.extrasaction = extrasaction
        self.writer = csv.writer(f, dialect, *args, **kwds)

    def _dict_to_list(self, rowdict):
        if self.extrasaction == "raise":
            wrong_fields = [k for k in rowdict
                            if k not in self.fieldnames.keys()]
            if wrong_fields:
                raise ValueError("dict contains fields not in fieldnames: " +
                                 ", ".join(wrong_fields))
        return [rowdict.get(key, self.restval)
                for key in self.fieldnames.keys()]

    def writeheader(self):
        return self.writer.writerow(self.fieldnames.values())

    def writerow(self, rowdict):
        result = None
        try: 
            result = self.writer.writerow(self._dict_to_list(rowdict))
        except Exception as e:
            print e
        return result

    def writerows(self, rowdicts):
        rows = []
        for rowdict in rowdicts:
            rows.append(self._dict_to_list(rowdict))
        return self.writer.writerows(rows)
